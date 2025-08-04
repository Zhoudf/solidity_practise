# ERC20代币合约项目

## 项目概述

本项目实现了一个完整的ERC20代币合约，符合以太坊ERC20标准，包含所有标准功能以及额外的代币增发功能。合约基于Solidity 0.8.19开发，使用Hardhat框架进行开发、测试和部署。

## 项目结构

## 合约功能

### 标准ERC20功能

1. **balanceOf(address account)** - 查询指定账户的代币余额
2. **transfer(address to, uint256 amount)** - 转账功能，将代币从调用者账户转移到指定账户
3. **approve(address spender, uint256 amount)** - 授权功能，允许指定账户代扣一定数量的代币
4. **transferFrom(address from, address to, uint256 amount)** - 代扣转账，使用已授权的额度进行转账
5. **allowance(address owner, address spender)** - 查询授权额度

### 扩展功能

1. **mint(address to, uint256 amount)** - 代币增发功能（仅合约所有者可调用）
2. **transferOwnership(address newOwner)** - 转移合约所有权

### 事件记录

- **Transfer(address indexed from, address indexed to, uint256 value)** - 转账事件
- **Approval(address indexed owner, address indexed spender, uint256 value)** - 授权事件
- **Mint(address indexed to, uint256 value)** - 增发事件

## 合约详细说明

### 状态变量

```solidity
string public name;           // 代币名称
string public symbol;         // 代币符号
uint8 public decimals;        // 小数位数
uint256 public totalSupply;   // 总供应量
address public owner;         // 合约所有者

// 账户余额映射
mapping(address => uint256) private _balances;

// 授权映射：owner => spender => amount
mapping(address => mapping(address => uint256)) private _allowances;
```

### 安全特性

1. **访问控制**：使用`onlyOwner`修饰符保护敏感功能
2. **输入验证**：完整的参数验证，防止零地址操作
3. **溢出保护**：使用Solidity 0.8+内置的溢出检查
4. **事件记录**：所有重要操作都会触发相应事件

## 环境配置

### 1. 安装依赖

```bash
cd solidity_task2
npm install
```

### 2. 环境变量配置

复制`.env.example`文件为`.env`并填入实际值：

```bash
cp .env.example .env
```

编辑`.env`文件：

```env
# Sepolia测试网RPC URL (使用Infura或Alchemy)
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# 部署账户的私钥 (不要提交到git)
PRIVATE_KEY=your_private_key_here

# Etherscan API Key (用于合约验证)
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. 获取测试网ETH

- 访问 [Sepolia Faucet](https://sepoliafaucet.com/) 获取测试ETH
- 或使用 [Alchemy Faucet](https://sepoliafaucet.com/)

## 部署指南

### 本地部署测试

1. **启动本地节点**：
```bash
npx hardhat node
```

2. **编译合约**：
```bash
npm run compile
```

3. **本地部署**：
```bash
npm run deploy:localhost
```

### Sepolia测试网部署

1. **确保配置正确**：检查`.env`文件中的配置

2. **部署到Sepolia**：
```bash
npm run deploy:sepolia
```

3. **验证部署**：部署成功后会显示合约地址和相关信息

## 使用方法

### 1. 导入钱包

部署成功后，将合约地址添加到MetaMask等钱包：

1. 打开MetaMask
2. 切换到Sepolia测试网
3. 点击"导入代币"
4. 输入合约地址
5. 代币信息会自动填充

### 2. 基本操作

#### 查看余额
```javascript
const balance = await token.balanceOf(userAddress);
console.log("余额:", ethers.utils.formatEther(balance));
```

#### 转账
```javascript
const tx = await token.transfer(recipientAddress, ethers.utils.parseEther("100"));
await tx.wait();
```

#### 授权
```javascript
const tx = await token.approve(spenderAddress, ethers.utils.parseEther("50"));
await tx.wait();
```

#### 代扣转账
```javascript
const tx = await token.transferFrom(fromAddress, toAddress, ethers.utils.parseEther("25"));
await tx.wait();
```

#### 增发代币（仅所有者）
```javascript
const tx = await token.mint(recipientAddress, ethers.utils.parseEther("1000"));
await tx.wait();
```

## 测试

### 创建测试文件

```javascript:d%3A%2Fworkspace_blockchain%2Fsolidity_practise%2Fsolidity_task2%2Ftest%2FERC20Token.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC20Token", function () {
  let token;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const ERC20Token = await ethers.getContractFactory("ERC20Token");
    token = await ERC20Token.deploy("TestToken", "TTK", 18, 1000000);
    await token.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply to the owner", async function () {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      await token.transfer(addr1.address, 50);
      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await token.balanceOf(owner.address);
      await expect(
        token.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("Allowances", function () {
    it("Should approve and transfer from", async function () {
      await token.approve(addr1.address, 100);
      await token.connect(addr1).transferFrom(owner.address, addr2.address, 50);
      
      expect(await token.balanceOf(addr2.address)).to.equal(50);
      expect(await token.allowance(owner.address, addr1.address)).to.equal(50);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      await token.mint(addr1.address, 1000);
      expect(await token.balanceOf(addr1.address)).to.equal(1000);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      await expect(
        token.connect(addr1).mint(addr2.address, 1000)
      ).to.be.revertedWith("Only owner can call this function");
    });
  });
});
```

### 运行测试

```bash
npx hardhat test
```

## 合约验证

部署到测试网后，可以在Etherscan上验证合约：

```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS "TokenName" "SYMBOL" 18 1000000
```

## 安全注意事项

1. **私钥安全**：
   - 永远不要将私钥提交到代码仓库
   - 使用`.env`文件存储敏感信息
   - 将`.env`添加到`.gitignore`

2. **合约安全**：
   - 所有外部调用都进行了输入验证
   - 使用了访问控制修饰符
   - 遵循了检查-效果-交互模式

3. **测试网使用**：
   - 仅在测试网进行测试
   - 主网部署前进行充分测试

## 常见问题

### Q: 部署失败怎么办？
A: 检查以下几点：
- 确保账户有足够的ETH支付gas费用
- 检查网络配置是否正确
- 确认私钥格式正确

### Q: 代币不显示在钱包中？
A: 
- 确认已切换到正确的网络（Sepolia）
- 手动添加代币合约地址
- 检查合约是否部署成功

### Q: 交易失败？
A: 
- 检查gas费用设置
- 确认账户余额充足
- 验证交易参数正确性

## 进阶功能

### 1. 添加暂停功能

可以添加暂停合约功能，在紧急情况下停止所有转账：

```solidity
bool public paused = false;

modifier whenNotPaused() {
    require(!paused, "Contract is paused");
    _;
}

function pause() public onlyOwner {
    paused = true;
}

function unpause() public onlyOwner {
    paused = false;
}
```

### 2. 添加销毁功能

```solidity
function burn(uint256 amount) public {
    require(_balances[msg.sender] >= amount, "Insufficient balance");
    _balances[msg.sender] -= amount;
    totalSupply -= amount;
    emit Transfer(msg.sender, address(0), amount);
}
```

## 许可证

本项目使用MIT许可证。详见LICENSE文件。

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 联系方式

如有问题，请通过以下方式联系：
- GitHub Issues
- 邮箱：your-email@example.com

---

**免责声明**：本合约仅用于学习和测试目的。在生产环境中使用前，请进行充分的安全审计。