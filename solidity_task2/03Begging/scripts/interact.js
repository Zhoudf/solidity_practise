const { ethers } = require("hardhat");

async function main() {
    // 替换为你部署的合约地址
    const contractAddress = "0xf2f3D323D80007a4704C50ABE2BaF5839CD4C147";

    // 获取合约实例
    const BeggingContract = await ethers.getContractFactory("BeggingContract");
    const beggingContract = BeggingContract.attach(contractAddress);

    // 获取签名者
    const [owner, donator1, donator2] = await ethers.getSigners();

    console.log("=== BeggingContract 交互测试 ===");
    console.log("合约地址:", contractAddress);
    console.log("合约所有者:", await beggingContract.owner());
    console.log("初始余额:", ethers.formatEther(await beggingContract.getContractBalance()), "ETH");

    // 测试捐赠功能
    console.log("\n--- 测试捐赠功能 ---");

    // 捐赠者1捐赠 0.01 ETH
    console.log("捐赠者1 捐赠 0.01 ETH...");
    const tx1 = await beggingContract.connect(donator1).donate({
        value: ethers.parseEther("0.01")
    });
    await tx1.wait();
    console.log("✅ 捐赠成功!");

    // 捐赠者2捐赠 0.02 ETH
    console.log("捐赠者2 捐赠 0.02 ETH...");
    const tx2 = await beggingContract.connect(donator2).donate({
        value: ethers.parseEther("0.02")
    });
    await tx2.wait();
    console.log("✅ 捐赠成功!");

    // 查询捐赠信息
    console.log("\n--- 查询捐赠信息 ---");
    console.log("合约总余额:", ethers.formatEther(await beggingContract.getContractBalance()), "ETH");
    console.log("总捐赠金额:", ethers.formatEther(await beggingContract.totalDonations()), "ETH");
    console.log("捐赠者数量:", await beggingContract.getDonatorCount());
    console.log("捐赠者1的捐赠:", ethers.formatEther(await beggingContract.getDonation(donator1.address)), "ETH");
    console.log("捐赠者2的捐赠:", ethers.formatEther(await beggingContract.getDonation(donator2.address)), "ETH");

    // 测试提取功能（只有所有者可以）
    console.log("\n--- 测试提取功能 ---");
    const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
    console.log("所有者提取前余额:", ethers.formatEther(ownerBalanceBefore), "ETH");

    const withdrawTx = await beggingContract.connect(owner).withdraw();
    await withdrawTx.wait();
    console.log("✅ 提取成功!");

    const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
    console.log("所有者提取后余额:", ethers.formatEther(ownerBalanceAfter), "ETH");
    console.log("合约余额:", ethers.formatEther(await beggingContract.getContractBalance()), "ETH");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });