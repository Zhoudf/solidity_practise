const { ethers } = require("hardhat");

async function main() {
    console.log("开始部署 BeggingContract...");
    
    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log("部署账户:", deployer.address);
    
    // 获取账户余额
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("账户余额:", ethers.formatEther(balance), "ETH");
    
    // 部署合约
    const BeggingContract = await ethers.getContractFactory("BeggingContract");
    const beggingContract = await BeggingContract.deploy();
    
    await beggingContract.waitForDeployment();
    
    const contractAddress = await beggingContract.getAddress();
    console.log("\n✅ BeggingContract 部署成功!");
    console.log("合约地址:", contractAddress);
    console.log("合约所有者:", await beggingContract.owner());
    console.log("合约余额:", ethers.formatEther(await beggingContract.getContractBalance()), "ETH");
    console.log("捐赠者数量:", await beggingContract.getDonatorCount());
    
    console.log("\n🔗 在 Etherscan 上查看:");
    console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
    
    // 验证合约（可选）
    if (process.env.ETHERSCAN_API_KEY) {
        console.log("\n⏳ 等待区块确认后验证合约...");
        await beggingContract.deploymentTransaction().wait(6);
        
        try {
            await hre.run("verify:verify", {
                address: contractAddress,
                constructorArguments: [],
            });
            console.log("✅ 合约验证成功!");
        } catch (error) {
            console.log("❌ 合约验证失败:", error.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });