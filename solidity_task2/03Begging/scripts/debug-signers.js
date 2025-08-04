const { ethers } = require("hardhat");

async function main() {
    console.log("=== 调试签名者获取 ===");
    
    try {
        // 获取所有签名者
        const signers = await ethers.getSigners();
        console.log("获取到的签名者数量:", signers.length);
        
        // 检查每个签名者
        for (let i = 0; i < signers.length; i++) {
            if (signers[i]) {
                console.log(`签名者${i}:`, signers[i].address);
                // 检查余额
                const balance = await ethers.provider.getBalance(signers[i].address);
                console.log(`签名者${i}余额:`, ethers.formatEther(balance), "ETH");
            } else {
                console.log(`签名者${i}: undefined`);
            }
        }
        
        // 检查网络
        const network = await ethers.provider.getNetwork();
        console.log("当前网络:", network.name, "链ID:", network.chainId.toString());
        
    } catch (error) {
        console.error("获取签名者时出错:", error.message);
        console.error("完整错误:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });