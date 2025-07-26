// SPDX-License-Identifier: GPL-3.0
// 指定该合约的开源许可证为 GPL-3.0，用于表明代码的使用和分发规则

pragma solidity >=0.7.0 <0.9.0;
// 指定该合约编译所使用的 Solidity 版本范围，要求版本大于等于 0.7.0 且小于 0.9.0

/**
 * @title ReverseString
 * @dev 实现字符串反转功能
 */
// 合约的文档注释，声明合约的标题为 ReverseString，作用是实现字符串反转功能
contract ReverseString {
    /**
     * @dev 反转输入的字符串
     * @param input 要反转的字符串
     * @return 反转后的字符串
     */
    // 函数的文档注释，说明该函数的作用是反转输入的字符串，参数 input 为要反转的字符串，返回值为反转后的字符串
    function reverseString(
        string memory input
    ) external pure returns (string memory) {
        // 将输入的字符串转换为 bytes 类型，因为 Solidity 中字符串不能直接通过索引访问，而 bytes 可以
        bytes memory inputBytes = bytes(input);
        // 获取输入字符串转换后的 bytes 数组的长度
        uint256 length = inputBytes.length;
        // 创建一个新的 bytes 数组，长度与输入字符串转换后的 bytes 数组长度相同，用于存储反转后的结果
        bytes memory reversedBytes = new bytes(length);

        // 使用 for 循环遍历输入字符串转换后的 bytes 数组
        for (uint256 i = 0; i < length; i++) {
            // 将输入字符串转换后的 bytes 数组中的元素按逆序赋值给新的 bytes 数组
            reversedBytes[i] = inputBytes[length - 1 - i];
        }

        // 将存储反转结果的 bytes 数组转换回字符串类型并返回
        return string(reversedBytes);
    }
}
