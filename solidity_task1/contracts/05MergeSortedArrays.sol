// SPDX-License-Identifier: GPL-3.0
// 指定该合约的开源许可证为 GPL-3.0，用于表明代码的使用和分发规则

pragma solidity >=0.7.0 <0.9.0;
// 指定该合约编译所使用的 Solidity 版本范围，要求版本大于等于 0.7.0 且小于 0.9.0

/**
 * @title MergeSortedArrays
 * @dev 实现将两个有序数组合并为一个有序数组的功能
 */
contract MergeSortedArrays {
    /**
     * @dev 合并两个有序数组为一个有序数组
     * @param arr1 第一个有序数组
     * @param arr2 第二个有序数组
     * @return 合并后的有序数组
     */
    function merge(
        uint256[] memory arr1,
        uint256[] memory arr2
    ) external pure returns (uint256[] memory) {
        // 计算两个数组的长度
        uint256 len1 = arr1.length;
        uint256 len2 = arr2.length;
        // 初始化合并后数组的长度，为两个输入数组长度之和
        uint256[] memory mergedArray = new uint256[](len1 + len2);
        // 初始化三个索引，分别用于遍历 arr1、arr2 和 mergedArray
        uint256 i = 0; // 用于遍历 arr1
        uint256 j = 0; // 用于遍历 arr2
        uint256 k = 0; // 用于遍历 mergedArray

        // 同时遍历 arr1 和 arr2，比较当前元素大小，将较小的元素放入 mergedArray
        while (i < len1 && j < len2) {
            if (arr1[i] <= arr2[j]) {
                // 如果 arr1 当前元素小于等于 arr2 当前元素，将 arr1 当前元素放入 mergedArray
                mergedArray[k] = arr1[i];
                i++;
            } else {
                // 否则，将 arr2 当前元素放入 mergedArray
                mergedArray[k] = arr2[j];
                j++;
            }
            k++;
        }

        // 如果 arr1 还有剩余元素，将其全部添加到 mergedArray 末尾
        while (i < len1) {
            mergedArray[k] = arr1[i];
            i++;
            k++;
        }

        // 如果 arr2 还有剩余元素，将其全部添加到 mergedArray 末尾
        while (j < len2) {
            mergedArray[k] = arr2[j];
            j++;
            k++;
        }

        // 返回合并后的有序数组
        return mergedArray;
    }
}
