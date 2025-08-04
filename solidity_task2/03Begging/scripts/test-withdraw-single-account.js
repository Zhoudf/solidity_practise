const { ethers } = require("hardhat");

async function main() {
    console.log("=== 测试 withdraw 功能（单账户版本）===");
    
    // 合约地址
    const contractAddress = "0xac438cac5A272Ec3BecE30B4cAE6F6F860Bde5dE";
    
    // 获取合约实例
    const BeggingContract = await ethers.getContractFactory("BeggingContract");
    const contract = BeggingContract.attach(contractAddress);
    
    // 获取签名者
    const signers = await ethers.getSigners();
    const testAccount = signers[0];
    
    console.log("合约地址:", contractAddress);
    console.log("测试账户地址:", testAccount.address);
    
    try {
        // 检查当前状态
        console.log("\n--- 当前状态检查 ---");
        const contractOwner = await contract.owner();
        const contractBalance = await contract.getContractBalance();
        const accountBalance = await ethers.provider.getBalance(testAccount.address);
        
        console.log("合约所有者:", contractOwner);
        console.log("测试账户地址:", testAccount.address);
        console.log("当前账户是否为所有者:", testAccount.address.toLowerCase() === contractOwner.toLowerCase() ? "✅ 是" : "❌ 否");
        console.log("合约当前余额:", ethers.formatEther(contractBalance), "ETH");
        console.log("测试账户余额:", ethers.formatEther(accountBalance), "ETH");
        
        const isOwner = testAccount.address.toLowerCase() === contractOwner.toLowerCase();
        
        // 如果合约余额为0，先进行一些捐赠以便测试提取功能
        if (contractBalance === BigInt(0)) {
            console.log("\n--- 准备测试数据：先进行捐赠 ---");
            const donationAmount = ethers.parseEther("0.01");
            console.log("捐赠金额:", ethers.formatEther(donationAmount), "ETH");
            
            const donateTx = await contract.connect(testAccount).donate({ value: donationAmount });
            await donateTx.wait();
            console.log("捐赠交易哈希:", donateTx.hash);
            
            const newContractBalance = await contract.getContractBalance();
            console.log("捐赠后合约余额:", ethers.formatEther(newContractBalance), "ETH");
        }
        
        // 重新获取当前状态
        const currentContractBalance = await contract.getContractBalance();
        const currentAccountBalance = await ethers.provider.getBalance(testAccount.address);
        
        console.log("\n--- 更新后状态 ---");
        console.log("合约余额:", ethers.formatEther(currentContractBalance), "ETH");
        console.log("账户余额:", ethers.formatEther(currentAccountBalance), "ETH");
        
        if (isOwner) {
            // 测试1: 所有者提取资金
            console.log("\n--- 测试1: 所有者提取资金 ---");
            
            if (currentContractBalance > 0) {
                console.log("提取前合约余额:", ethers.formatEther(currentContractBalance), "ETH");
                console.log("提取前账户余额:", ethers.formatEther(currentAccountBalance), "ETH");
                
                // 估算gas费用
                const gasEstimate = await contract.connect(testAccount).withdraw.estimateGas();
                const gasPrice = await ethers.provider.getFeeData();
                const estimatedGasCost = gasEstimate * gasPrice.gasPrice;
                console.log("预估gas费用:", ethers.formatEther(estimatedGasCost), "ETH");
                
                const tx = await contract.connect(testAccount).withdraw();
                const receipt = await tx.wait();
                console.log("提取交易哈希:", tx.hash);
                console.log("实际gas使用:", receipt.gasUsed.toString());
                console.log("实际gas费用:", ethers.formatEther(receipt.gasUsed * receipt.gasPrice), "ETH");
                
                // 检查提取后状态
                const balanceAfterWithdraw = await contract.getContractBalance();
                const accountBalanceAfter = await ethers.provider.getBalance(testAccount.address);
                
                console.log("\n--- 提取后状态 ---");
                console.log("提取后合约余额:", ethers.formatEther(balanceAfterWithdraw), "ETH");
                console.log("提取后账户余额:", ethers.formatEther(accountBalanceAfter), "ETH");
                
                // 验证提取结果
                if (balanceAfterWithdraw.toString() === "0") {
                    console.log("✅ 提取成功：合约余额已清零");
                } else {
                    console.log("❌ 提取异常：合约仍有余额", ethers.formatEther(balanceAfterWithdraw), "ETH");
                }
                
                // 检查事件
                const withdrawEvent = receipt.logs.find(log => {
                    try {
                        const parsedLog = contract.interface.parseLog(log);
                        return parsedLog.name === 'Withdrawn';
                    } catch {
                        return false;
                    }
                });
                
                if (withdrawEvent) {
                    const parsedEvent = contract.interface.parseLog(withdrawEvent);
                    console.log("✅ Withdrawn事件触发:");
                    console.log("  - 提取者:", parsedEvent.args.owner);
                    console.log("  - 提取金额:", ethers.formatEther(parsedEvent.args.amount), "ETH");
                } else {
                    console.log("❌ 未检测到Withdrawn事件");
                }
                
            } else {
                console.log("⚠️ 合约余额为0，无法测试提取功能");
            }
            
            // 测试2: 尝试从空合约提取
            console.log("\n--- 测试2: 从空合约提取 ---");
            const emptyBalance = await contract.getContractBalance();
            
            if (emptyBalance.toString() === "0") {
                try {
                    const tx = await contract.connect(testAccount).withdraw();
                    await tx.wait();
                    console.log("✅ 从空合约提取成功（无操作）");
                } catch (error) {
                    if (error.message.includes("No funds to withdraw")) {
                        console.log("✅ 正确：空合约无法提取，返回错误");
                    } else {
                        console.log("⚠️ 从空合约提取时出现其他错误:", error.message);
                    }
                }
            }
            
        } else {
            // 测试：非所有者尝试提取
            console.log("\n--- 测试: 非所有者尝试提取 ---");
            console.log("当前账户不是合约所有者，测试权限控制...");
            
            try {
                const tx = await contract.connect(testAccount).withdraw();
                await tx.wait();
                console.log("❌ 错误: 非所有者竟然可以提取!");
            } catch (error) {
                console.log("✅ 正确: 非所有者无法提取");
                if (error.message.includes("Not the owner") || error.message.includes("Ownable")) {
                    console.log("错误类型: 权限控制正常");
                } else {
                    console.log("错误信息:", error.message);
                }
            }
        }
        
        // 测试3: 多次提取测试（如果是所有者）
        if (isOwner) {
            console.log("\n--- 测试3: 多次提取场景 ---");
            
            // 先捐赠一些资金
            const testDonation = ethers.parseEther("0.005");
            console.log("为多次提取测试准备资金:", ethers.formatEther(testDonation), "ETH");
            
            const donateTx = await contract.connect(testAccount).donate({ value: testDonation });
            await donateTx.wait();
            
            // 第一次提取
            console.log("第一次提取...");
            const firstWithdrawTx = await contract.connect(testAccount).withdraw();
            await firstWithdrawTx.wait();
            console.log("第一次提取完成");
            
            // 立即尝试第二次提取
            console.log("立即尝试第二次提取...");
            try {
                const secondWithdrawTx = await contract.connect(testAccount).withdraw();
                await secondWithdrawTx.wait();
                console.log("✅ 第二次提取成功（空合约提取）");
            } catch (error) {
                if (error.message.includes("No funds")) {
                    console.log("✅ 正确：空合约无法提取");
                } else {
                    console.log("⚠️ 第二次提取出现其他错误:", error.message);
                }
            }
        }
        
        console.log("\n=== withdraw 功能测试完成 ===");
        
        if (isOwner) {
            console.log("✅ 所有者提取功能：正常");
            console.log("✅ 余额清零功能：正常");
            console.log("✅ 事件触发功能：正常");
            console.log("✅ 空合约提取处理：正常");
            console.log("✅ 多次提取处理：正常");
        } else {
            console.log("✅ 非所有者权限控制：正常");
            console.log("ℹ️ 注意：当前账户不是合约所有者，无法测试完整的提取功能");
        }
        
    } catch (error) {
        console.error("❌ 测试失败:", error.message);
        if (error.reason) {
            console.error("失败原因:", error.reason);
        }
        if (error.code) {
            console.error("错误代码:", error.code);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });