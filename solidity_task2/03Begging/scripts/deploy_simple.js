const { ethers } = require("hardhat");

async function main() {
    console.log("开始部署简化版 BeggingContract...");
    
    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log("部署账户:", deployer.address);
    
    // 获取账户余额
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("账户余额:", ethers.formatEther(balance), "ETH");
    
    // 使用正确的文件名（小写 simple）
    console.log("\n📦 正在编译和部署合约...");
    const BeggingContract = await ethers.getContractFactory("contracts/BeggingContract_simple.sol:BeggingContract");
    const beggingContract = await BeggingContract.deploy();
    
    console.log("⏳ 等待部署交易确认...");
    await beggingContract.waitForDeployment();
    
    const contractAddress = await beggingContract.getAddress();
    console.log("\n✅ BeggingContract 部署成功!");
    console.log("合约地址:", contractAddress);
    console.log("合约所有者:", await beggingContract.owner());
    console.log("合约余额:", ethers.formatEther(await beggingContract.getContractBalance()), "ETH");
    console.log("捐赠者数量:", await beggingContract.getDonatorCount());
    
    console.log("\n🔗 在 Etherscan 上查看:");
    console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
    
    // 保存部署信息
    const deploymentInfo = {
        contractAddress: contractAddress,
        deployer: deployer.address,
        network: "sepolia",
        timestamp: new Date().toISOString(),
        txHash: beggingContract.deploymentTransaction().hash
    };
    
    console.log("\n📄 部署信息:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    // 验证合约
    if (process.env.ETHERSCAN_API_KEY) {
        console.log("\n⏳ 等待 6 个区块确认后验证合约...");
        await beggingContract.deploymentTransaction().wait(6);
        
        try {
            console.log("🔍 开始验证合约...");
            await hre.run("verify:verify", {
                address: contractAddress,
                constructorArguments: [],
            });
            console.log("✅ 合约验证成功!");
        } catch (error) {
            console.log("❌ 合约验证失败:", error.message);
            console.log("\n📝 手动验证信息:");
            console.log("- 编译器版本: 0.8.20");
            console.log("- 优化: 启用 (200 runs)");
            console.log("- 许可证: MIT");
            console.log("- 构造函数参数: 无");
        }
    } else {
        console.log("\n⚠️  未设置 ETHERSCAN_API_KEY，跳过自动验证");
        console.log("手动验证时请使用以下设置:");
        console.log("- 编译器版本: 0.8.20");
        console.log("- 优化: 启用 (200 runs)");
        console.log("- 许可证: MIT");
        console.log("- 构造函数参数: 无");
    }
    
    return contractAddress;
}

main()
    .then((address) => {
        console.log("\n🎉 部署完成! 合约地址:", address);
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ 部署失败:", error);
        process.exit(1);
    });