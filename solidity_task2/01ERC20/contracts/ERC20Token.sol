// SPDX-License-Identifier: MIT
// 指定开源许可证，MIT许可证允许自由使用、修改和分发
pragma solidity ^0.8.0;
// 指定Solidity编译器版本，^0.8.0表示兼容0.8.0及以上版本

/**
 * @title ERC20Token
 * @dev 实现标准ERC20代币合约
 * @notice 这是一个完整的ERC20代币实现，包含标准功能和扩展功能
 *
 * ERC20标准定义了以下必须实现的功能：
 * - totalSupply(): 返回代币总供应量
 * - balanceOf(address): 返回指定地址的余额
 * - transfer(address, uint256): 转账功能
 * - allowance(address, address): 查询授权额度
 * - approve(address, uint256): 授权功能
 * - transferFrom(address, address, uint256): 代扣转账
 * - Transfer事件: 记录转账操作
 * - Approval事件: 记录授权操作
 */
contract ERC20Token {
    // ============ 状态变量 ============

    /**
     * @dev 代币基本信息
     * 这些变量定义了代币的基本属性
     */
    string public name; // 代币名称，如"Bitcoin"
    string public symbol; // 代币符号，如"BTC"
    uint8 public decimals; // 小数位数，通常为18，表示1个代币=10^18个最小单位
    uint256 private _totalSupply; // 代币总供应量，使用私有变量避免与函数名冲突

    /**
     * @dev 合约治理
     * owner变量用于权限控制，只有owner可以执行某些特殊操作
     */
    address public owner; // 合约所有者地址，拥有特殊权限

    /**
     * @dev 核心数据存储
     * 使用mapping实现高效的键值对存储
     */
    // 存储每个地址的代币余额：地址 => 余额
    mapping(address => uint256) private _balances;

    // 存储授权信息：授权方地址 => (被授权方地址 => 授权金额)
    // 例如：_allowances[Alice][Bob] = 100 表示Alice授权Bob可以代扣100个代币
    mapping(address => mapping(address => uint256)) private _allowances;

    // ============ 事件定义 ============

    /**
     * @dev ERC20标准事件
     * 事件用于记录重要操作，便于外部监听和查询
     * 触发事件，记录合约状态变更上链
     */

    // 转账事件：当代币从一个地址转移到另一个地址时触发
    // indexed关键字表示该参数可以被索引，便于查询
    event Transfer(address indexed from, address indexed to, uint256 value);

    // 授权事件：当设置或更改授权额度时触发
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    /**
     * @dev 扩展事件
     * 这些事件不是ERC20标准要求的，但有助于跟踪合约状态
     * 触发事件，记录合约状态变更上链
     */

    // 增发事件：当新代币被创建时触发
    event Mint(address indexed to, uint256 value);

    // 所有权转移事件：当合约所有权发生变更时触发
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // ============ 修饰符 ============

    /**
     * @dev 权限控制修饰符
     * 确保只有合约所有者可以调用特定函数
     */
    modifier onlyOwner() {
        // require语句用于条件检查，如果条件不满足则回滚交易
        require(msg.sender == owner, "Only owner can call this function");
        _; // 占位符，表示被修饰函数的代码在此处执行
    }

    // ============ 构造函数 ============

    /**
     * @dev 构造函数 - 合约部署时执行一次
     * @param _name 代币名称
     * @param _symbol 代币符号
     * @param _decimals 小数位数
     * @param _initialSupply 初始供应量（不包含小数位）
     *
     * 构造函数的作用：
     * 1. 设置代币基本信息
     * 2. 设置合约所有者
     * 3. 铸造初始代币并分配给部署者
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply
    ) {
        // 设置代币基本信息
        name = _name;
        symbol = _symbol;
        decimals = _decimals;

        // 计算实际总供应量：初始供应量 * 10^小数位数
        // 例如：如果_initialSupply=1000，_decimals=18，则实际供应量=1000*10^18
        _totalSupply = _initialSupply * 10 ** _decimals;

        // 设置合约部署者为所有者
        owner = msg.sender;

        // 将所有初始代币分配给合约部署者
        _balances[msg.sender] = _totalSupply;

        // 触发转账事件，从零地址（代表铸造）转移到部署者
        emit Transfer(address(0), msg.sender, _totalSupply);
    }

    // ============ ERC20标准函数 ============

    /**
     * @dev 返回代币总供应量
     * @return 当前代币的总供应量
     *
     * 这是ERC20标准必须实现的函数之一
     * 返回所有已发行代币的总数量
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev 查询指定地址的代币余额
     * @param account 要查询的账户地址
     * @return 该地址拥有的代币数量
     *
     * view关键字表示这是一个只读函数，不会修改区块链状态
     */
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev 转账功能 - 从调用者账户转移代币到指定地址
     * @param to 接收方地址
     * @param amount 转账金额
     * @return 操作是否成功
     *
     * 转账流程：
     * 1. 检查发送方余额是否充足
     * 2. 减少发送方余额
     * 3. 增加接收方余额
     * 4. 触发Transfer事件
     */
    function transfer(address to, uint256 amount) public returns (bool) {
        address from = msg.sender; // msg.sender是调用此函数的地址
        _transfer(from, to, amount); // 调用内部转账函数
        return true; // ERC20标准要求返回bool值表示成功
    }

    /**
     * @dev 查询授权额度
     * @param owner 授权方地址（代币拥有者）
     * @param spender 被授权方地址（可以代扣的地址）
     * @return 被授权方可以代扣的代币数量
     *
     * 授权机制允许第三方代表代币拥有者进行转账
     * 常用于去中心化交易所等场景
     */
    function allowance(
        address owner,
        address spender
    ) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev 授权功能 - 允许指定地址代扣一定数量的代币
     * @param spender 被授权方地址
     * @param amount 授权金额
     * @return 操作是否成功
     *
     * 注意：重复调用approve会覆盖之前的授权额度
     * 为了安全，建议先将授权额度设为0，再设置新的额度
     */
    function approve(address spender, uint256 amount) public returns (bool) {
        address owner = msg.sender; // 授权方是调用者
        _approve(owner, spender, amount); // 调用内部授权函数
        return true;
    }

    /**
     * @dev 代扣转账功能 - 在授权范围内代表他人进行转账
     * @param from 转出方地址（代币拥有者）
     * @param to 接收方地址
     * @param amount 转账金额
     * @return 操作是否成功
     *
     * 代扣转账流程：
     * 1. 检查调用者是否有足够的授权额度
     * 2. 减少授权额度
     * 3. 执行转账
     * 4. 触发相关事件
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public returns (bool) {
        address spender = msg.sender; // 调用者（被授权方）

        // 获取当前授权额度
        uint256 currentAllowance = allowance(from, spender);

        // 检查授权额度是否充足
        require(
            currentAllowance >= amount,
            "ERC20: transfer amount exceeds allowance"
        );

        // 减少授权额度（消耗授权）
        _approve(from, spender, currentAllowance - amount);

        // 执行转账
        _transfer(from, to, amount);

        return true;
    }

    // ============ 扩展功能 ============

    /**
     * @dev 增发代币功能 - 创建新的代币并分配给指定地址
     * @param to 接收新代币的地址
     * @param amount 增发数量
     *
     * 注意：只有合约所有者可以调用此函数
     * 增发会增加总供应量和指定地址的余额
     */
    function mint(address to, uint256 amount) public onlyOwner {
        // 检查接收地址不能是零地址
        require(to != address(0), "ERC20: mint to the zero address");

        // 增加总供应量
        _totalSupply += amount;

        // 增加接收方余额
        _balances[to] += amount;

        // 触发转账事件（从零地址转移表示铸造）
        emit Transfer(address(0), to, amount);

        // 触发增发事件
        emit Mint(to, amount);
    }

    /**
     * @dev 销毁代币功能 - 从指定地址销毁代币
     * @param from 销毁代币的地址
     * @param amount 销毁数量
     *
     * 注意：只有合约所有者可以调用此函数
     * 销毁会减少总供应量和指定地址的余额
     */
    function burn(address from, uint256 amount) public onlyOwner {
        // 检查销毁地址不能是零地址
        require(from != address(0), "ERC20: burn from the zero address");

        // 检查余额是否充足
        require(
            _balances[from] >= amount,
            "ERC20: burn amount exceeds balance"
        );

        // 减少指定地址的余额
        _balances[from] -= amount;

        // 减少总供应量
        _totalSupply -= amount;

        // 触发转账事件（转移到零地址表示销毁）
        emit Transfer(from, address(0), amount);
    }

    // ============ 内部函数 ============

    /**
     * @dev 内部转账函数 - 实现转账的核心逻辑
     * @param from 转出方地址
     * @param to 接收方地址
     * @param amount 转账金额
     *
     * 这是一个内部函数，只能被合约内的其他函数调用
     * 包含了转账的所有安全检查和状态更新
     */
    function _transfer(address from, address to, uint256 amount) internal {
        // 安全检查：转出方不能是零地址
        require(from != address(0), "ERC20: transfer from the zero address");

        // 安全检查：接收方不能是零地址
        require(to != address(0), "ERC20: transfer to the zero address");

        // 获取转出方当前余额
        uint256 fromBalance = _balances[from];

        // 检查余额是否充足
        require(
            fromBalance >= amount,
            "ERC20: transfer amount exceeds balance"
        );

        // 更新余额：减少转出方余额
        _balances[from] = fromBalance - amount;

        // 更新余额：增加接收方余额
        _balances[to] += amount;

        // 触发转账事件，记录此次转账
        emit Transfer(from, to, amount);
    }

    /**
     * @dev 内部授权函数 - 实现授权的核心逻辑
     * @param owner 授权方地址
     * @param spender 被授权方地址
     * @param amount 授权金额
     *
     * 这是一个内部函数，处理授权的安全检查和状态更新
     */
    function _approve(address owner, address spender, uint256 amount) internal {
        // 安全检查：授权方不能是零地址
        require(owner != address(0), "ERC20: approve from the zero address");

        // 安全检查：被授权方不能是零地址
        require(spender != address(0), "ERC20: approve to the zero address");

        // 设置授权额度
        _allowances[owner][spender] = amount;

        // 触发授权事件，记录此次授权
        emit Approval(owner, spender, amount);
    }

    // ============ 所有权管理 ============

    /**
     * @dev 转移合约所有权
     * @param newOwner 新所有者地址
     *
     * 只有当前所有者可以调用此函数
     * 用于将合约控制权转移给其他地址
     */
    function transferOwnership(address newOwner) public onlyOwner {
        // 检查新所有者不能是零地址
        require(newOwner != address(0), "New owner cannot be zero address");

        // 记录旧所有者
        address previousOwner = owner;

        // 更新所有者
        owner = newOwner;

        // 触发所有权转移事件
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    /**
     * @dev 放弃所有权 - 将所有权转移给零地址
     *
     * 注意：此操作不可逆！执行后将无法再调用onlyOwner函数
     * 通常用于去中心化项目，确保没有中心化控制
     */
    function renounceOwnership() public onlyOwner {
        // 记录旧所有者
        address previousOwner = owner;

        // 将所有权设为零地址（表示放弃）
        owner = address(0);

        // 触发所有权转移事件
        emit OwnershipTransferred(previousOwner, address(0));
    }
}
