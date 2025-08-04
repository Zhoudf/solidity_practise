# Solidity Task 1 - 算法练习合约

本项目包含6个Solidity智能合约，实现了常见的算法和数据结构操作。

## 项目结构


## 合约列表

### 1. 01Voting.sol
投票合约，实现基本的投票功能。

### 2. 02ReverseString.sol
字符串反转算法实现。

### 3. 03RomanToInteger.sol
罗马数字转整数算法。

### 4. 04IntegerToRoman.sol
整数转罗马数字算法。

### 5. 05MergeSortedArrays.sol
合并排序数组算法实现。

### 6. 06BinarySearch.sol
二分查找算法实现。

## 脚本说明

`scripts` 文件夹包含四个TypeScript文件，用于使用 `web3.js` 和 `ethers.js` 库部署合约：

- `deploy_with_ethers.ts` - 使用ethers.js部署合约
- `deploy_with_web3.ts` - 使用web3.js部署合约
- `ethers-lib.ts` - ethers.js库文件
- `web3-lib.ts` - web3.js库文件

## 测试

`tests` 文件夹包含：
- `Ballot_test.sol` - Ballot合约的Solidity测试文件
- `storage.test.js` - Storage合约的JavaScript测试文件

## 使用方法

1. 在Remix IDE中打开项目
2. 编译所需的Solidity合约
3. 右键点击脚本文件名并选择'Run'来运行部署脚本
4. 脚本输出将显示在Remix终端中

## 注意事项

- 运行脚本前必须先编译Solidity文件
- Remix IDE对require/import的支持有限
- 支持的模块：ethers, web3, swarmgw, chai, multihashes, remix, hardhat
- 不支持的模块会显示错误：'<module_name> module require is not supported by Remix IDE'