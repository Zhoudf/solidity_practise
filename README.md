# Solidity Practice Project

这是一个Solidity智能合约学习和实践项目，包含多个任务和实际应用场景的合约开发。

## 项目结构

### Task 1 - 基础算法合约 (solidity_task1)

基础Solidity合约实现，包含常见算法和数据结构：

1. **投票合约 (Voting.sol)**
   - 创建一个名为Voting的合约，包含以下功能：
   - 一个mapping来存储候选人的得票数
   - 一个vote函数，允许用户投票给某个候选人
   - 一个getVotes函数，返回某个候选人的得票数
   - 一个resetVotes函数，重置所有候选人的得票数

2. **反转字符串 (ReverseString.sol)**
   - 题目描述：反转一个字符串。输入 "abcde"，输出 "edcba"

3. **罗马数字转整数 (RomanToInteger.sol)**
   - 题目描述：用 Solidity 实现罗马数字转整数
   - 参考：https://leetcode.cn/problems/roman-to-integer/description/

4. **整数转罗马数字 (IntegerToRoman.sol)**
   - 题目描述：用 Solidity 实现整数转罗马数字
   - 参考：https://leetcode.cn/problems/integer-to-roman/description/

5. **合并两个有序数组 (MergeSortedArrays.sol)**
   - 题目描述：将两个有序数组合并为一个有序数组

6. **二分查找 (BinarySearch.sol)**
   - 题目描述：在一个有序数组中查找目标值

### Task 2 - 高级智能合约项目 (solidity_task2)

包含三个完整的智能合约项目，使用Hardhat开发框架：

#### 01ERC20 - ERC20代币合约
- 标准ERC20代币实现
- 包含完整的测试套件
- 支持部署脚本

#### 02NFT - NFT合约项目
- ERC721标准NFT合约实现
- 包含元数据管理
- 使用Hardhat Ignition部署

#### 03Begging - 众筹合约
- 去中心化众筹平台合约
- 包含资金管理和目标达成逻辑
- 完整的测试覆盖

### Task 3 - 高级项目 (solidity_task3)

更复杂的智能合约应用场景（待开发）

## 开发环境

- **Task 1**: 使用Remix IDE开发
- **Task 2**: 使用Hardhat框架
- **Task 3**: 待定

## 快速开始

### Task 1 使用方法
1. 在Remix IDE中打开 `solidity_task1` 目录
2. 编译合约文件
3. 部署到测试网络
4. 运行测试脚本

### Task 2 使用方法
1. 进入对应的子项目目录
2. 安装依赖：`npm install`
3. 编译合约：`npx hardhat compile`
4. 运行测试：`npx hardhat test`
5. 部署合约：`npx hardhat run scripts/deploy.js`

## 注意事项

- 所有项目都已配置 `.gitignore` 文件，排除敏感文件如 `.env` 和 `node_modules`
- 请在部署前确保配置正确的网络参数
- 建议在测试网络上进行开发和测试

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 许可证

MIT License
