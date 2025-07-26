// SPDX-License-Identifier: GPL-3.0
// 指定该合约的开源许可证为 GPL-3.0，用于表明代码的使用和分发规则

pragma solidity >=0.7.0 <0.9.0;
// 指定该合约编译所使用的 Solidity 版本范围，要求版本大于等于 0.7.0 且小于 0.9.0

/**
 * @title IntegerToRoman
 * @dev 实现将整数转换为罗马数字的功能。
 * 罗马数字由七个不同符号表示，对应的值分别为：
 * I - 1, V - 5, X - 10, L - 50, C - 100, D - 500, M - 1000。
 * 转换规则如下：
 * 1. 若值不以 4 或 9 开头，选择能从输入中减去的最大符号值，将该符号添加到结果，减去对应值后继续转换剩余部分。
 * 2. 若值以 4 或 9 开头，使用减法形式，仅包含 4 (IV), 9 (IX), 40 (XL), 90 (XC), 400 (CD), 900 (CM)。
 * 3. 只有 10 的次方（I, X, C, M）最多可连续附加 3 次，不能多次附加 5 (V), 50 (L), 500 (D)，需附加 4 次时用减法形式。
 */
contract IntegerToRoman {
    /**
     * @dev 将输入的整数转换为对应的罗马数字。
     * @param num 要转换的整数，范围通常为 1 到 3999。
     * @return 转换后的罗马数字字符串。
     */
    function intToRoman(uint256 num) external pure returns (string memory) {
        // 定义罗马数字符号数组
        string[13] memory romanSymbols = [
            "M",
            "CM",
            "D",
            "CD",
            "C",
            "XC",
            "L",
            "XL",
            "X",
            "IX",
            "V",
            "IV",
            "I"
        ];
        // 定义与罗马数字符号对应的整数值数组
        uint256[13] memory values = [
            uint256(1000),
            uint256(900),
            uint256(500),
            uint256(400),
            uint256(100),
            uint256(90),
            uint256(50),
            uint256(40),
            uint256(10),
            uint256(9),
            uint256(5),
            uint256(4),
            uint256(1)
        ];
        // 初始化一个空的 bytes 数组，用于存储最终的罗马数字字符串
        bytes memory result = new bytes(100);
        // 初始化结果字符串的索引
        uint256 index = 0;

        // 遍历整数值数组
        for (uint256 i = 0; i < values.length; i++) {
            // 当当前整数值小于等于输入的数字时
            while (values[i] <= num) {
                // 获取当前罗马数字符号
                bytes memory symbol = bytes(romanSymbols[i]);
                // 将当前罗马数字符号添加到结果数组中
                for (uint256 j = 0; j < symbol.length; j++) {
                    result[index] = symbol[j];
                    index++;
                }
                // 从输入数字中减去当前整数值
                num -= values[i];
            }
        }

        // 截取结果数组中有效的部分并转换为字符串返回
        bytes memory finalResult = new bytes(index);
        for (uint256 k = 0; k < index; k++) {
            finalResult[k] = result[k];
        }
        return string(finalResult);
    }
}
