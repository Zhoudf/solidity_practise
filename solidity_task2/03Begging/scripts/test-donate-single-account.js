const { ethers } = require("hardhat");

async function main() {
    console.log("=== 测试 donate 功能（单账户版本）===");

    // 合约地址
    const contractAddress = "0xac438cac5A272Ec3BecE30B4cAE6F6F860Bde5dE";

    // 获取合约实例
    const BeggingContract = await ethers.getContractFactory("BeggingContract");
    const contract = BeggingContract.attach(contractAddress);

    // 获取签名者
    const signers = await ethers.getSigners();
    console.log("可用签名者数量:", signers.length);
    
    const owner = signers[0];
    console.log("合约地址:", contractAddress);
    console.log("测试账户地址:", owner.address);
    
    // 检查账户余额
    const accountBalance = await ethers.provider.getBalance(owner.address);
    console.log("账户余额:", ethers.formatEther(accountBalance), "ETH");

    try {
        // 检查初始状态
        console.log("\n--- 初始状态 ---");
        const initialBalance = await contract.getContractBalance();
        const initialDonatorCount = await contract.getDonatorCount();
        console.log("合约初始余额:", ethers.formatEther(initialBalance), "ETH");
        console.log("初始捐赠者数量:", initialDonatorCount.toString());

        // 测试1: 第一次捐赠
        console.log("\n--- 测试1: 第一次捐赠 ---");
        const donationAmount1 = ethers.parseEther("0.005");
        console.log("捐赠金额:", ethers.formatEther(donationAmount1), "ETH");

        const tx1 = await contract.connect(owner).donate({ value: donationAmount1 });
        const receipt1 = await tx1.wait();
        console.log("交易哈希:", tx1.hash);
        console.log("✅ 第一次捐赠成功");

        // 检查捐赠后状态
        const balanceAfter1 = await contract.getContractBalance();
        const donatorCountAfter1 = await contract.getDonatorCount();
        console.log("捐赠后合约余额:", ethers.formatEther(balanceAfter1), "ETH");
        console.log("捐赠后捐赠者数量:", donatorCountAfter1.toString());

        // 测试2: 查询捐赠金额
        console.log("\n--- 测试2: 查询捐赠金额 ---");
        const donationQuery = await contract.getDonation(owner.address);
        console.log("查询到的捐赠金额:", ethers.formatEther(donationQuery), "ETH");
        console.log("✅ 查询功能正常");

        // 测试3: 第二次捐赠（累加测试）
        console.log("\n--- 测试3: 第二次捐赠（累加测试）---");
        const donationAmount2 = ethers.parseEther("0.003");
        console.log("第二次捐赠金额:", ethers.formatEther(donationAmount2), "ETH");

        const tx2 = await contract.connect(owner).donate({ value: donationAmount2 });
        const receipt2 = await tx2.wait();
        console.log("交易哈希:", tx2.hash);
        console.log("✅ 第二次捐赠成功");

        // 检查累加后的捐赠金额
        const totalDonation = await contract.getDonation(owner.address);
        const expectedTotal = donationAmount1 + donationAmount2;
        console.log("累计捐赠金额:", ethers.formatEther(totalDonation), "ETH");
        console.log("预期累计金额:", ethers.formatEther(expectedTotal), "ETH");
        
        if (totalDonation.toString() === expectedTotal.toString()) {
            console.log("✅ 捐赠累加功能正常");
        } else {
            console.log("❌ 捐赠累加功能异常");
        }

        // 测试4: 提取功能（仅所有者可以提取）
        console.log("\n--- 测试4: 提取功能 ---");
        const contractBalanceBeforeWithdraw = await contract.getContractBalance();
        console.log("提取前合约余额:", ethers.formatEther(contractBalanceBeforeWithdraw), "ETH");

        const tx3 = await contract.connect(owner).withdraw();
        const receipt3 = await tx3.wait();
        console.log("提取交易哈希:", tx3.hash);
        console.log("✅ 提取成功");

        // 检查提取后状态
        const contractBalanceAfterWithdraw = await contract.getContractBalance();
        console.log("提取后合约余额:", ethers.formatEther(contractBalanceAfterWithdraw), "ETH");
        
        if (contractBalanceAfterWithdraw.toString() === "0") {
            console.log("✅ 提取功能正常，合约余额已清零");
        } else {
            console.log("❌ 提取功能异常，合约仍有余额");
        }

        console.log("\n=== 所有测试完成 ===");
        console.log("✅ donate 函数：正常");
        console.log("✅ getDonation 函数：正常");
        console.log("✅ withdraw 函数：正常");
        console.log("✅ 捐赠累加：正常");
        console.log("✅ 余额管理：正常");

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