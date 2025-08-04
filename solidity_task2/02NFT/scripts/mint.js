const { ethers } = require("hardhat");

async function main() {
    // 替换为你部署的合约地址
    const contractAddress = "0x95B3a0c789862e7a5Cdb7275531735368B77D7D8";

    // 替换为你的元数据 IPFS URI
    const tokenURI = "ipfs://bafkreidt2r5dqa3k5jmlgo4p2vcse3h2xmue7ceqcmazcktbqay5y57vza";

    // 获取合约实例
    const MyNFT = await ethers.getContractFactory("MyNFT");
    const myNFT = MyNFT.attach(contractAddress);

    // 获取签名者（铸造者）
    const [owner] = await ethers.getSigners();

    console.log("铸造 NFT 中...");
    console.log("接收地址:", owner.address);
    console.log("元数据 URI:", tokenURI);

    // 铸造 NFT
    const tx = await myNFT.mintNFT(owner.address, tokenURI);
    await tx.wait();

    console.log("✅ NFT 铸造成功!");
    console.log("交易哈希:", tx.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });