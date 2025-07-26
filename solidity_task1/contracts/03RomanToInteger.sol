// SPDX-License-Identifier: GPL-3.0
// 指定该合约的开源许可证为 GPL-3.0，用于表明代码的使用和分发规则

pragma solidity >=0.7.0 <0.9.0;
// 指定该合约编译所使用的 Solidity 版本范围，要求版本大于等于 0.7.0 且小于 0.9.0

/**
 * @title RomanToInteger
 * @dev 实现将罗马数字转换为整数的功能。
 * 罗马数字包含以下七种字符: I， V， X， L，C，D 和 M，对应数值分别为 1, 5, 10, 50, 100, 500, 1000。
 * 通常小数字在大数字右边，但存在六种特例：
 * 1. I 可以放在 V (5) 和 X (10) 的左边，来表示 4 和 9。
 * 2. X 可以放在 L (50) 和 C (100) 的左边，来表示 40 和 90。
 * 3. C 可以放在 D (500) 和 M (1000) 的左边，来表示 400 和 900。
 */
contract RomanToInteger {
    /**
     * @dev 将输入的罗马数字字符串转换为对应的整数。
     * @param roman 要转换的罗马数字字符串。
     * @return 转换后的整数。
     */
    function romanToInt(string memory roman) external pure returns (uint256) {
        // 将输入的罗马数字字符串转换为 bytes 类型，方便按字符访问
        bytes memory romanBytes = bytes(roman);
        // 初始化最终结果为 0
        uint256 result = 0;

        // 遍历罗马数字字符串的每个字符
        for (uint256 i = 0; i < romanBytes.length; i++) {
            // 获取当前字符对应的数值
            uint256 currentValue = charToValue(romanBytes[i]);
            // 如果不是最后一个字符，获取下一个字符对应的数值
            if (i + 1 < romanBytes.length) {
                uint256 nextValue = charToValue(romanBytes[i + 1]);
                // 若当前字符数值小于下一个字符数值，说明是特殊情况，需要用下一个数值减去当前数值
                if (currentValue < nextValue) {
                    result += nextValue - currentValue;
                    // 由于已经处理了当前和下一个字符，跳过下一个字符
                    i++;
                } else {
                    // 正常情况，直接累加当前字符对应的数值
                    result += currentValue;
                }
            } else {
                // 处理最后一个字符，直接累加其对应的数值
                result += currentValue;
            }
        }

        // 返回最终转换结果
        return result;
    }

    /**
     * @dev 将单个罗马字符转换为对应的整数数值。
     * @param char 要转换的单个罗马字符。
     * @return 该字符对应的整数数值。
     */
    function charToValue(bytes1 char) internal pure returns (uint256) {
        // 根据不同的罗马字符返回对应的数值
        if (char == "I") return 1;
        if (char == "V") return 5;
        if (char == "X") return 10;
        if (char == "L") return 50;
        if (char == "C") return 100;
        if (char == "D") return 500;
        if (char == "M") return 1000;
        // 若输入字符不是有效的罗马字符，返回 0
        return 0;
    }
}
