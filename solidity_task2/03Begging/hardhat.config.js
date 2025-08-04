require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        sepolia: {
            url: process.env.SEPOLIA_URL,
            accounts: [
                process.env.PRIVATE_KEY,
                process.env.PRIVATE_KEY_2, // 确保有第二个私钥
                process.env.PRIVATE_KEY_3  // 确保有第三个私钥
            ],
            timeout: 60000, // 增加超时时间到 60 秒
            gas: 2100000,
            gasPrice: 8000000000
        }
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY
    },
    // 启用 Sourcify（可选）
    sourcify: {
        enabled: false // 或设为 true 启用
    }
};