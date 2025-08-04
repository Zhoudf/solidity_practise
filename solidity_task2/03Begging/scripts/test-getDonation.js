const { ethers } = require("hardhat");

async function main() {
    console.log("=== 测试 getDonation 功能 ===");
    
    // 合约地址
    const contractAddress = "0xac438cac5A272Ec3BecE30B4cAE6F6F860Bde5dE";
    
    // 获取合约实例
    const BeggingContract = await ethers.getContractFactory("BeggingContract");
    const contract = BeggingContract.attach(contractAddress);
    
    // 获取签名者
    const [owner, donor1, donor2] = await ethers.getSigners();
    
    console.log("合约地址:", contractAddress);
    console.log("测试地址1:", donor1.address);
    console.log("测试地址2:", donor2.address);
    
    try {
        // 测试1: 查询从未捐赠的地址
        console.log("\n--- 测试1: 查询从未捐赠的地址 ---");
        const donation0 = await contract.getDonation("0x0000000000000000000000000000000000000001");
        console.log("从未捐赠地址的捐赠金额:", ethers.formatEther(donation0), "ETH (应该是0)");
        
        // 测试2: 查询已捐赠地址的金额
        console.log("\n--- 测试2: 查询已捐赠地址 ---");
        const donation1 = await contract.getDonation(donor1.address);
        const donation2 = await contract.getDonation(donor2.address);
        
        console.log("捐赠者1的捐赠金额:", ethers.formatEther(donation1), "ETH");
        console.log("捐赠者2的捐赠金额:", ethers.formatEther(donation2), "ETH");
        
        // 测试3: 获取所有捐赠者列表并查询每个人的捐赠金额
        console.log("\n--- 测试3: 查询所有捐赠者的捐赠金额 ---");
        const donatorCount = await contract.getDonatorCount();
        console.log("总捐赠者数量:", donatorCount.toString());
        
        if (donatorCount > 0) {
            const allDonators = await contract.getAllDonators();
            console.log("所有捐赠者地址:", allDonators);
            
            for (let i = 0; i < allDonators.length; i++) {
                const donatorAddress = allDonators[i];
                const donationAmount = await contract.getDonation(donatorAddress);
                console.log(`捐赠者 ${i + 1} (${donatorAddress}): ${ethers.formatEther(donationAmount)} ETH`);
            }
        }
        
        // 测试4: 验证 getDonation 与合约状态的一致性
        console.log("\n--- 测试4: 验证数据一致性 ---");
        const contractBalance = await contract.getContractBalance();
        console.log("合约总余额:", ethers.formatEther(contractBalance), "ETH");
        
        // 计算所有捐赠者的捐赠总和
        let totalCalculated = ethers.parseEther("0");
        if (donatorCount > 0) {
            const allDonators = await contract.getAllDonators();
            for (const donatorAddress of allDonators) {
                const donationAmount = await contract.getDonation(donatorAddress);
                totalCalculated = totalCalculated + donationAmount;
            }
        }
        
        console.log("计算的捐赠总额:", ethers.formatEther(totalCalculated), "ETH");
        console.log("数据一致性检查:", contractBalance === totalCalculated ? "✅ 一致" : "❌ 不一致");
        
        console.log("\n✅ getDonation 功能测试完成!");
        
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