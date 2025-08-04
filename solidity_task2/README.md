# Solidity Task 2 - 高级智能合约项目

本项目包含三个高级智能合约项目，涵盖ERC20代币、NFT和众筹合约的实现。

## 项目结构


## 子项目介绍

### 1. 01ERC20 - ERC20代币合约

实现标准的ERC20代币合约，包含：
- 代币发行
- 转账功能
- 授权机制
- 余额查询

**技术栈：** Hardhat, Solidity

### 2. 02NFT - 非同质化代币合约

实现ERC721标准的NFT合约，包含：
- NFT铸造
- 所有权转移
- 元数据管理
- 授权操作

**技术栈：** Hardhat, Solidity, IPFS

### 3. 03Begging - 众筹合约

实现去中心化众筹平台，包含：
- 捐赠功能
- 资金提取
- 捐赠记录查询
- 权限控制

**技术栈：** Hardhat, Solidity, Ethers.js

## 开发环境

每个子项目都使用Hardhat作为开发框架，包含：
- 智能合约编译
- 本地测试网络
- 部署脚本
- 单元测试
- 网络配置

## 快速开始

1. 进入具体的子项目目录
2. 安装依赖：`npm install`
3. 编译合约：`npx hardhat compile`
4. 运行测试：`npx hardhat test`
5. 部署合约：`npx hardhat run scripts/deploy.js --network <network>`

## 网络配置

支持的网络：
- Hardhat本地网络
- Sepolia测试网
- 以太坊主网（需配置）

## 安全注意事项

- 所有项目都包含`.gitignore`文件，确保敏感信息不被提交
- 私钥和API密钥存储在`.env`文件中
- 部署前请仔细检查合约代码和配置

## 贡献指南

1. Fork本项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 许可证

MIT License