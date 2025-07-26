// SPDX-License-Identifier: GPL-3.0
// 指定该合约的开源许可证为 GPL-3.0，用于表明代码的使用和分发规则

pragma solidity >=0.7.0 <0.9.0;
// 指定该合约编译所使用的 Solidity 版本范围，要求版本大于等于 0.7.0 且小于 0.9.0

/**
 * @title BinarySearch
 * @dev 实现二分查找算法，用于在有序数组中查找目标元素的索引
 */
contract BinarySearch {
    /**
     * @dev 在有序数组中查找目标元素的索引
     * @param arr 升序排列的整数数组
     * @param target 要查找的目标元素
     * @return 如果找到目标元素，返回其在数组中的索引；如果未找到，返回 -1（在 Solidity 中用类型最大值表示）
     */
    function binarySearch(
        uint256[] memory arr,
        uint256 target
    ) external pure returns (int256) {
        // 初始化左指针，指向数组的第一个元素
        int256 left = 0;
        // 初始化右指针，指向数组的最后一个元素
        int256 right = int256(arr.length) - 1;

        // 当左指针小于等于右指针时，继续查找
        while (left <= right) {
            // 计算中间元素的索引
            int256 mid = left + (right - left) / 2;

            // 获取中间元素的值
            uint256 midValue = arr[uint256(mid)];

            if (midValue == target) {
                // 如果中间元素的值等于目标元素，返回中间元素的索引
                return mid;
            } else if (midValue < target) {
                // 如果中间元素的值小于目标元素，说明目标元素在右半部分，更新左指针
                left = mid + 1;
            } else {
                // 如果中间元素的值大于目标元素，说明目标元素在左半部分，更新右指针
                right = mid - 1;
            }
        }

        // 若未找到目标元素，返回 -1（在 Solidity 中用类型最大值表示）
        return -1;
    }
}
