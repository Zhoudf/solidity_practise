const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署 NFT 合约...");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // 部署合约
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();
  await myNFT.waitForDeployment();

  const contractAddress = await myNFT.getAddress();
  console.log("NFT 合约部署到:", contractAddress);
  console.log("合约名称:", await myNFT.name());
  console.log("合约符号:", await myNFT.symbol());
  console.log("当前 Token ID:", await myNFT.getCurrentTokenId());

  console.log("\n=== 部署完成 ===");
  console.log(`在 Sepolia Etherscan 查看: https://sepolia.etherscan.io/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });