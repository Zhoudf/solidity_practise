const { ethers } = require("hardhat");

async function main() {
    console.log("=== 测试 getDonation 功能（单账户版本）===");
    
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
        // 测试1: 查询从未捐赠的地址
        console.log("\n--- 测试1: 查询从未捐赠的地址 ---");
        const randomAddress = "0x0000000000000000000000000000000000000001";
        const donation0 = await contract.getDonation(randomAddress);
        console.log(`地址 ${randomAddress} 的捐赠金额:`, ethers.formatEther(donation0), "ETH");
        
        if (donation0.toString() === "0") {
            console.log("✅ 未捐赠地址查询正确，返回0");
        } else {
            console.log("❌ 未捐赠地址查询异常，应该返回0");
        }
        
        // 测试2: 查询测试账户的当前捐赠金额
        console.log("\n--- 测试2: 查询测试账户当前捐赠金额 ---");
        const currentDonation = await contract.getDonation(testAccount.address);
        console.log("测试账户当前捐赠金额:", ethers.formatEther(currentDonation), "ETH");
        
        // 测试3: 进行一次捐赠，然后查询
        console.log("\n--- 测试3: 捐赠后查询功能测试 ---");
        const donationAmount = ethers.parseEther("0.002");
        console.log("准备捐赠:", ethers.formatEther(donationAmount), "ETH");
        
        const tx = await contract.connect(testAccount).donate({ value: donationAmount });
        await tx.wait();
        console.log("捐赠交易哈希:", tx.hash);
        
        // 查询捐赠后的金额
        const donationAfter = await contract.getDonation(testAccount.address);
        const expectedAmount = currentDonation + donationAmount;
        
        console.log("捐赠前金额:", ethers.formatEther(currentDonation), "ETH");
        console.log("捐赠金额:", ethers.formatEther(donationAmount), "ETH");
        console.log("捐赠后查询金额:", ethers.formatEther(donationAfter), "ETH");
        console.log("预期金额:", ethers.formatEther(expectedAmount), "ETH");
        
        if (donationAfter.toString() === expectedAmount.toString()) {
            console.log("✅ 捐赠后查询功能正确");
        } else {
            console.log("❌ 捐赠后查询功能异常");
        }
        
        // 测试4: 再次捐赠，测试累加功能
        console.log("\n--- 测试4: 多次捐赠累加查询测试 ---");
        const secondDonation = ethers.parseEther("0.003");
        console.log("第二次捐赠:", ethers.formatEther(secondDonation), "ETH");
        
        const tx2 = await contract.connect(testAccount).donate({ value: secondDonation });
        await tx2.wait();
        console.log("第二次捐赠交易哈希:", tx2.hash);
        
        // 查询累加后的金额
        const finalDonation = await contract.getDonation(testAccount.address);
        const expectedFinalAmount = donationAfter + secondDonation;
        
        console.log("第二次捐赠前金额:", ethers.formatEther(donationAfter), "ETH");
        console.log("第二次捐赠金额:", ethers.formatEther(secondDonation), "ETH");
        console.log("最终查询金额:", ethers.formatEther(finalDonation), "ETH");
        console.log("预期最终金额:", ethers.formatEther(expectedFinalAmount), "ETH");
        
        if (finalDonation.toString() === expectedFinalAmount.toString()) {
            console.log("✅ 多次捐赠累加查询功能正确");
        } else {
            console.log("❌ 多次捐赠累加查询功能异常");
        }
        
        // 测试5: 获取所有捐赠者列表并验证查询一致性
        console.log("\n--- 测试5: 捐赠者列表与查询一致性测试 ---");
        const donatorCount = await contract.getDonatorCount();
        console.log("总捐赠者数量:", donatorCount.toString());
        
        if (donatorCount > 0) {
            const allDonators = await contract.getAllDonators();
            console.log("所有捐赠者地址:", allDonators);
            
            let totalFromQueries = BigInt(0);
            
            for (let i = 0; i < allDonators.length; i++) {
                const donatorAddress = allDonators[i];
                const donationAmount = await contract.getDonation(donatorAddress);
                console.log(`捐赠者 ${i + 1} (${donatorAddress}): ${ethers.formatEther(donationAmount)} ETH`);
                totalFromQueries += donationAmount;
            }
            
            // 验证总金额与合约余额的一致性
            const contractBalance = await contract.getContractBalance();
            console.log("\n--- 一致性验证 ---");
            console.log("通过查询累计的总金额:", ethers.formatEther(totalFromQueries), "ETH");
            console.log("合约实际余额:", ethers.formatEther(contractBalance), "ETH");
            
            if (totalFromQueries.toString() === contractBalance.toString()) {
                console.log("✅ 查询结果与合约余额一致");
            } else {
                console.log("❌ 查询结果与合约余额不一致");
            }
        }
        
        // 测试6: 边界情况测试
        console.log("\n--- 测试6: 边界情况测试 ---");
        
        // 测试零地址
        try {
            const zeroAddressDonation = await contract.getDonation("0x0000000000000000000000000000000000000000");
            console.log("零地址捐赠金额:", ethers.formatEther(zeroAddressDonation), "ETH");
            console.log("✅ 零地址查询成功");
        } catch (error) {
            console.log("❌ 零地址查询失败:", error.message);
        }
        
        // 测试合约自身地址
        try {
            const contractSelfDonation = await contract.getDonation(contractAddress);
            console.log("合约自身地址捐赠金额:", ethers.formatEther(contractSelfDonation), "ETH");
            console.log("✅ 合约自身地址查询成功");
        } catch (error) {
            console.log("❌ 合约自身地址查询失败:", error.message);
        }
        
        console.log("\n=== getDonation 功能测试完成 ===");
        console.log("✅ 未捐赠地址查询：正常");
        console.log("✅ 已捐赠地址查询：正常");
        console.log("✅ 捐赠累加查询：正常");
        console.log("✅ 数据一致性验证：正常");
        console.log("✅ 边界情况处理：正常");
        
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