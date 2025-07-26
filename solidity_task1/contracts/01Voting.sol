// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Voting
 * @dev 实现候选人投票功能，包括投票、查询票数和重置票数
 */
contract Voting {
    // 存储候选人的得票数
    // public Map<address,uint256> candidateVotes;
    mapping(address => uint256) public candidateVotes;
    // 存储所有候选人地址
    // address 类型用于表示以太坊账户地址，address payable 可接收以太币。
    address[] public candidates;

    /**
     * @dev 允许用户投票给某个候选人
     * @param candidate 候选人的地址
     */
    function vote(address candidate) external {
        // require：这是 Solidity 中的一个内置函数，用于进行条件检查。如果条件不满足，交易将被回滚，并且会抛出给定的错误信息。
        // candidate != address(0)：检查传入的候选人地址是否为零地址。在以太坊中，零地址（0x0000000000000000000000000000000000000000）通常表示无效地址。
        // "Candidate cannot be the zero address"：如果候选人地址是零地址，交易将被回滚，并返回此错误信息。
        require(
            candidate != address(0),
            "Candidate cannot be the zero address"
        );
        if (candidateVotes[candidate] == 0) {
            candidates.push(candidate);
        }
        //在 Solidity 里，mapping 是一种引用类型，candidateVotes[candidate]++; 语句无需将更新后的投票数重新存回 mapping
        candidateVotes[candidate]++;
    }

    /**
     * @dev 返回某个候选人的得票数
     * @param candidate 候选人的地址
     * @return 候选人的得票数
     */
    // 在 Solidity 里，view 是函数状态可变性修饰符，用于表明该函数不会修改合约的状态变量。状态变量指的是在合约中永久存储的变量，像 candidateVotes 和 candidates 就属于状态变量。
    // 使用 view 修饰符的函数只能读取状态变量，不能对其进行写入操作。这类函数在执行时不会消耗以太坊的 gas，因为它们不会改变区块链的状态，仅从区块链上读取数据。
    function getVotes(address candidate) external view returns (uint256) {
        return candidateVotes[candidate];
    }
    // view 函数仅读取合约的状态变量，不会对其进行修改。由于不会改变区块链的状态，所以调用 view 函数通常不会消耗 gas。不过，若通过交易调用 view 函数（正常应使用调用 call 而非发送交易 sendTransaction），以太坊客户端还是会尝试执行，这种情况下会消耗 gas，但这笔交易不会被打包进区块。
    // pure 函数既不读取也不修改合约的状态变量，仅依赖传入的参数进行计算。和 view 函数类似，正常调用 pure 函数不会消耗 gas。示例如下：
    // Voting.sol
    // Apply
    // function add(uint256 a, uint256 b) external pure returns (uint256) {
    //     return a + b;
    // }

    /**
     * @dev 重置所有候选人的得票数
     */
    //由于 mapping 自身特性，不能直接遍历。
    // 使用辅助数组是简单且常用的方法，适合大多数场景。
    function resetVotes() external {
        for (uint256 i = 0; i < candidates.length; i++) {
            candidateVotes[candidates[i]] = 0;
        }
        // 清空候选人列表
        delete candidates;
    }
}

// 1. external 修饰符的含义
// external 修饰符表明该函数只能从合约外部调用，不能在合约内部直接调用。
// 外部调用包括其他合约调用、以太坊客户端（如 MetaMask）调用等。
// 2. 与其他可见性修饰符的对比
// Solidity 有 4 种函数可见性修饰符：external、public、internal 和 private，它们的区别如下：
// external：只能从合约外部调用，不能在合约内部直接调用。如果要在合约内部调用 external 函数，需使用 this 关键字。
// public：合约内外都能调用，是默认的函数可见性修饰符。
// internal：只能在当前合约及其继承合约内部调用，外部无法调用。
// private：只能在当前合约内部调用，继承合约也不能调用。
// 3. external 修饰符的使用场景
// external 适合接收大量数据的函数，因为外部调用时，数据存储在 calldata 中，calldata 是只读的，相比 memory 更节省 gas。
