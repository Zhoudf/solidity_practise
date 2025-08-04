const { ethers } = require("hardhat");

async function main() {
    console.log("=== 测试 withdraw 功能 ===");
    
    // 合约地址
    const contractAddress = "0xac438cac5A272Ec3BecE30B4cAE6F6F860Bde5dE";
    
    // 获取合约实例
    const BeggingContract = await ethers.getContractFactory("BeggingContract");
    const contract = BeggingContract.attach(contractAddress);
    
    // 获取签名者
    const [owner, donor1] = await ethers.getSigners();
    
    console.log("合约地址:", contractAddress);
    console.log("所有者地址:", owner.address);
    console.log("非所有者地址:", donor1.address);
    
    try {
        // 检查当前状态
        console.log("\n--- 当前状态 ---");
        const contractOwner = await contract.owner();
        const contractBalance = await contract.getContractBalance();
        const ownerBalance = await ethers.provider.getBalance(owner.address);
        
        console.log("合约所有者:", contractOwner);
        console.log("当前调用者是否为所有者:", owner.address.toLowerCase() === contractOwner.toLowerCase() ? "✅ 是" : "❌ 否");
        console.log("合约余额:", ethers.formatEther(contractBalance), "ETH");
        console.log("所有者余额:", ethers.formatEther(ownerBalance), "ETH");
        
        // 测试1: 非所有者尝试提取（应该失败）
        console.log("\n--- 测试1: 非所有者尝试提取 ---");
        try {
            const tx = await contract.connect(donor1).withdraw();
            await tx.wait();
            console.log("❌ 错误: 非所有者竟然可以提取!");
        } catch (error) {
            console.log("✅ 正确: 非所有者无法提取");
            console.log("错误信息:", error.message.includes("Not the owner") ? "Not the owner" : error.message);
        }
        
        // 测试2: 所有者提取（如果有余额）
        if (contractBalance > 0) {
            console.log("\n--- 测试2: 所有者提取资金 ---");
            console.log("提取前合约余额:", ethers.formatEther(contractBalance), "ETH");
            console.log("提取前所有者余额:", ethers.formatEther(ownerBalance), "ETH");
            
            const tx = await contract.connect(owner).withdraw();
            const receipt = await tx.wait();
            console.log("提取交易哈希:", tx.hash);
            
            // 检查事件
            const withdrawalEvent = receipt.logs.find(log => {
                try {
                    return contract.interface.parseLog(log).name === 'Withdrawal';
                } catch {
                    return false;
                }
            });
            
            if (withdrawalEvent) {
                const parsedEvent = contract.interface.parseLog(withdrawalEvent);
                console.log("✅ Withdrawal 事件触发:");
                console.log("  - 所有者:", parsedEvent.args.owner);
                console.log("  - 金额:", ethers.formatEther(parsedEvent.args.amount), "ETH");
                console.log("  - 时间戳:", parsedEvent.args.timestamp.toString());
            }
            
            // 检查提取后的状态
            const newContractBalance = await contract.getContractBalance();
            const newOwnerBalance = await ethers.provider.getBalance(owner.address);
            
            console.log("提取后合约余额:", ethers.formatEther(newContractBalance), "ETH (应该是0)");
            console.log("提取后所有者余额:", ethers.formatEther(newOwnerBalance), "ETH");
            
            // 验证余额变化
            if (newContractBalance === 0n) {
                console.log("✅ 合约余额已清零");
            } else {
                console.log("❌ 合约余额未清零");
            }
            
        } else {
            console.log("\n--- 测试2: 合约无余额时提取 ---");
            try {
                const tx = await contract.connect(owner).withdraw();
                await tx.wait();
                console.log("❌ 错误: 无余额时竟然可以提取!");
            } catch (error) {
                console.log("✅ 正确: 无余额时无法提取");
                console.log("错误信息:", error.message.includes("No funds to withdraw") ? "No funds to withdraw" : error.message);
            }
        }
        
        // 测试3: 提取后再次尝试提取（应该失败）
        console.log("\n--- 测试3: 提取后再次尝试提取 ---");
        try {
            const tx = await contract.connect(owner).withdraw();
            await tx.wait();
            console.log("❌ 错误: 空余额时竟然可以提取!");
        } catch (error) {
            console.log("✅ 正确: 空余额时无法提取");
            console.log("错误信息:", error.message.includes("No funds to withdraw") ? "No funds to withdraw" : error.message);
        }
        
        console.log("\n✅ withdraw 功能测试完成!");
        
    } catch (error) {
        console.error("❌ 测试失败:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });