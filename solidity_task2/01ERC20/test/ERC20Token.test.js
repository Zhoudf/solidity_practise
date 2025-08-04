const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC20Token", function () {
    let token;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    beforeEach(async function () {
        // 获取测试账户
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        // 部署合约
        const ERC20Token = await ethers.getContractFactory("ERC20Token");
        token = await ERC20Token.deploy("TestToken", "TTK", 18, 1000000);
        await token.deployed();
    });

    describe("部署测试", function () {
        it("应该正确设置合约所有者", async function () {
            expect(await token.owner()).to.equal(owner.address);
        });

        it("应该正确设置代币信息", async function () {
            expect(await token.name()).to.equal("TestToken");
            expect(await token.symbol()).to.equal("TTK");
            expect(await token.decimals()).to.equal(18);
        });

        it("应该将总供应量分配给所有者", async function () {
            const ownerBalance = await token.balanceOf(owner.address);
            const totalSupply = await token.totalSupply();
            expect(totalSupply).to.equal(ownerBalance);
            expect(totalSupply).to.equal(ethers.utils.parseEther("1000000"));
        });
    });

    describe("转账功能测试", function () {
        it("应该能够在账户间转账", async function () {
            const transferAmount = ethers.utils.parseEther("100");

            // 执行转账
            await token.transfer(addr1.address, transferAmount);

            // 检查余额
            const addr1Balance = await token.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(transferAmount);

            // 检查所有者余额减少
            const ownerBalance = await token.balanceOf(owner.address);
            const expectedOwnerBalance = ethers.utils.parseEther("999900");
            expect(ownerBalance).to.equal(expectedOwnerBalance);
        });

        it("余额不足时转账应该失败", async function () {
            const transferAmount = ethers.utils.parseEther("1");

            // addr1没有代币，转账应该失败
            await expect(
                token.connect(addr1).transfer(owner.address, transferAmount)
            ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });

        it("转账到零地址应该失败", async function () {
            const transferAmount = ethers.utils.parseEther("100");

            await expect(
                token.transfer(ethers.constants.AddressZero, transferAmount)
            ).to.be.revertedWith("ERC20: transfer to the zero address");
        });

        it("应该触发Transfer事件", async function () {
            const transferAmount = ethers.utils.parseEther("100");

            await expect(token.transfer(addr1.address, transferAmount))
                .to.emit(token, "Transfer")
                .withArgs(owner.address, addr1.address, transferAmount);
        });
    });

    describe("授权功能测试", function () {
        it("应该能够授权和查询授权额度", async function () {
            const approveAmount = ethers.utils.parseEther("200");

            // 授权
            await token.approve(addr1.address, approveAmount);

            // 查询授权额度
            const allowance = await token.allowance(owner.address, addr1.address);
            expect(allowance).to.equal(approveAmount);
        });

        it("应该能够使用授权进行代扣转账", async function () {
            const approveAmount = ethers.utils.parseEther("200");
            const transferAmount = ethers.utils.parseEther("100");

            // 授权
            await token.approve(addr1.address, approveAmount);

            // 代扣转账
            await token.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);

            // 检查余额
            const addr2Balance = await token.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(transferAmount);

            // 检查剩余授权额度
            const remainingAllowance = await token.allowance(owner.address, addr1.address);
            expect(remainingAllowance).to.equal(approveAmount.sub(transferAmount));
        });

        it("超出授权额度的代扣转账应该失败", async function () {
            const approveAmount = ethers.utils.parseEther("100");
            const transferAmount = ethers.utils.parseEther("200");

            // 授权
            await token.approve(addr1.address, approveAmount);

            // 尝试超额代扣转账
            await expect(
                token.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount)
            ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
        });

        it("应该触发Approval事件", async function () {
            const approveAmount = ethers.utils.parseEther("200");

            await expect(token.approve(addr1.address, approveAmount))
                .to.emit(token, "Approval")
                .withArgs(owner.address, addr1.address, approveAmount);
        });
    });

    describe("增发功能测试", function () {
        it("所有者应该能够增发代币", async function () {
            const mintAmount = ethers.utils.parseEther("1000");
            const initialSupply = await token.totalSupply();

            // 增发代币
            await token.mint(addr1.address, mintAmount);

            // 检查余额
            const addr1Balance = await token.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(mintAmount);

            // 检查总供应量
            const newTotalSupply = await token.totalSupply();
            expect(newTotalSupply).to.equal(initialSupply.add(mintAmount));
        });

        it("非所有者不能增发代币", async function () {
            const mintAmount = ethers.utils.parseEther("1000");

            await expect(
                token.connect(addr1).mint(addr2.address, mintAmount)
            ).to.be.revertedWith("Only owner can call this function");
        });

        it("增发到零地址应该失败", async function () {
            const mintAmount = ethers.utils.parseEther("1000");

            await expect(
                token.mint(ethers.constants.AddressZero, mintAmount)
            ).to.be.revertedWith("ERC20: mint to the zero address");
        });

        it("应该触发Transfer和Mint事件", async function () {
            const mintAmount = ethers.utils.parseEther("1000");

            await expect(token.mint(addr1.address, mintAmount))
                .to.emit(token, "Transfer")
                .withArgs(ethers.constants.AddressZero, addr1.address, mintAmount)
                .and.to.emit(token, "Mint")
                .withArgs(addr1.address, mintAmount);
        });
    });

    describe("所有权转移测试", function () {
        it("所有者应该能够转移所有权", async function () {
            // 转移所有权
            await token.transferOwnership(addr1.address);

            // 检查新所有者
            expect(await token.owner()).to.equal(addr1.address);
        });

        it("非所有者不能转移所有权", async function () {
            await expect(
                token.connect(addr1).transferOwnership(addr2.address)
            ).to.be.revertedWith("Only owner can call this function");
        });

        it("不能转移所有权到零地址", async function () {
            await expect(
                token.transferOwnership(ethers.constants.AddressZero)
            ).to.be.revertedWith("New owner cannot be zero address");
        });
    });

    describe("边界条件测试", function () {
        it("应该能够转账全部余额", async function () {
            const ownerBalance = await token.balanceOf(owner.address);

            // 转账全部余额
            await token.transfer(addr1.address, ownerBalance);

            // 检查余额
            expect(await token.balanceOf(owner.address)).to.equal(0);
            expect(await token.balanceOf(addr1.address)).to.equal(ownerBalance);
        });

        it("应该能够转账0个代币", async function () {
            await expect(token.transfer(addr1.address, 0))
                .to.emit(token, "Transfer")
                .withArgs(owner.address, addr1.address, 0);
        });

        it("应该能够授权0个代币", async function () {
            await expect(token.approve(addr1.address, 0))
                .to.emit(token, "Approval")
                .withArgs(owner.address, addr1.address, 0);
        });
    });
});