const { ethers } = require("hardhat");

async function main() {
    // 获取部署者账户
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // 修复：使用provider获取余额
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance));

    // 代币参数
    const tokenName = "Bellscoin";
    const tokenSymbol = "BELLS";
    const decimals = 18;
    const initialSupply = 500000000; // 5亿代币

    // 部署合约
    const ERC20Token = await ethers.getContractFactory("ERC20Token");
    const token = await ERC20Token.deploy(tokenName, tokenSymbol, decimals, initialSupply);

    // 修复：等待部署完成
    await token.waitForDeployment();

    // 修复：获取合约地址
    const tokenAddress = await token.getAddress();
    console.log("ERC20Token deployed to:", tokenAddress);
    console.log("Token Name:", tokenName);
    console.log("Token Symbol:", tokenSymbol);
    console.log("Decimals:", decimals);
    console.log("Initial Supply:", initialSupply);

    // 验证部署
    const totalSupply = await token.totalSupply();
    const ownerBalance = await token.balanceOf(deployer.address);

    // 修复：使用新的formatEther语法
    console.log("Total Supply:", ethers.formatEther(totalSupply));
    console.log("Owner Balance:", ethers.formatEther(ownerBalance));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });