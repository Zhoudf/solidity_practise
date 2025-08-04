const { ethers } = require("hardhat");

async function main() {
    console.log("=== 测试 donate 功能 ===");

    // 合约地址
    const contractAddress = "0xac438cac5A272Ec3BecE30B4cAE6F6F860Bde5dE";

    // 获取合约实例
    const BeggingContract = await ethers.getContractFactory("BeggingContract");
    const contract = BeggingContract.attach(contractAddress);

    // 获取签名者
    const [owner, donor1, donor2] = await ethers.getSigners();

    console.log("合约地址:", contractAddress);
    console.log("所有者地址:", owner.address);
    console.log("捐赠者1地址:", donor1.address);
    console.log("捐赠者2地址:", donor2.address);

    try {
        // 检查初始状态
        console.log("\n--- 初始状态 ---");
        const initialBalance = await contract.getContractBalance();
        const initialDonatorCount = await contract.getDonatorCount();
        console.log("合约初始余额:", ethers.formatEther(initialBalance), "ETH");
        console.log("初始捐赠者数量:", initialDonatorCount.toString());

        // 测试1: 第一次捐赠
        console.log("\n--- 测试1: 第一次捐赠 ---");
        const donationAmount1 = ethers.parseEther("0.005");
        console.log("捐赠者1捐赠:", ethers.formatEther(donationAmount1), "ETH");

        const tx1 = await contract.connect(donor1).donate({ value: donationAmount1 });
        const receipt1 = await tx1.wait();
        console.log("交易哈希:", tx1.hash);

        // 检查事件
        const donationEvent1 = receipt1.logs.find(log => {
            try {
                return contract.interface.parseLog(log).name === 'DonationReceived';
            } catch {
                return false;
            }
        });

        if (donationEvent1) {
            const parsedEvent = contract.interface.parseLog(donationEvent1);
            console.log("✅ DonationReceived 事件触发:");
            console.log("  - 捐赠者:", parsedEvent.args.donator);
            console.log("  - 金额:", ethers.formatEther(parsedEvent.args.amount), "ETH");
            console.log("  - 时间戳:", parsedEvent.args.timestamp.toString());
        }

        // 检查状态更新
        const balance1 = await contract.getContractBalance();
        const donation1 = await contract.getDonation(donor1.address);
        const donatorCount1 = await contract.getDonatorCount();

        console.log("合约余额:", ethers.formatEther(balance1), "ETH");
        console.log("捐赠者1的捐赠总额:", ethers.formatEther(donation1), "ETH");
        console.log("捐赠者数量:", donatorCount1.toString());

        // 测试2: 同一捐赠者再次捐赠
        console.log("\n--- 测试2: 同一捐赠者再次捐赠 ---");
        const donationAmount2 = ethers.parseEther("0.006");
        console.log("捐赠者1再次捐赠:", ethers.formatEther(donationAmount2), "ETH");

        const tx2 = await contract.connect(donor1).donate({ value: donationAmount2 });
        await tx2.wait();
        console.log("交易哈希:", tx2.hash);

        const balance2 = await contract.getContractBalance();
        const donation2 = await contract.getDonation(donor1.address);
        const donatorCount2 = await contract.getDonatorCount();

        console.log("合约余额:", ethers.formatEther(balance2), "ETH");
        console.log("捐赠者1的捐赠总额:", ethers.formatEther(donation2), "ETH");
        console.log("捐赠者数量:", donatorCount2.toString(), "(应该还是1，因为是同一个捐赠者)");

        // 测试3: 新捐赠者捐赠
        console.log("\n--- 测试3: 新捐赠者捐赠 ---");
        const donationAmount3 = ethers.parseEther("0.007");
        console.log("捐赠者2捐赠:", ethers.formatEther(donationAmount3), "ETH");

        const tx3 = await contract.connect(donor2).donate({ value: donationAmount3 });
        await tx3.wait();
        console.log("交易哈希:", tx3.hash);

        const balance3 = await contract.getContractBalance();
        const donation3 = await contract.getDonation(donor2.address);
        const donatorCount3 = await contract.getDonatorCount();

        console.log("合约余额:", ethers.formatEther(balance3), "ETH");
        console.log("捐赠者2的捐赠总额:", ethers.formatEther(donation3), "ETH");
        console.log("捐赠者数量:", donatorCount3.toString(), "(应该是2)");

        // 测试4: 通过 receive 函数捐赠
        console.log("\n--- 测试4: 通过直接发送ETH捐赠 ---");
        const donationAmount4 = ethers.parseEther("0.003");
        console.log("捐赠者1直接发送:", ethers.formatEther(donationAmount4), "ETH");

        const tx4 = await donor1.sendTransaction({
            to: contractAddress,
            value: donationAmount4
        });
        await tx4.wait();
        console.log("交易哈希:", tx4.hash);

        const finalBalance = await contract.getContractBalance();
        const finalDonation1 = await contract.getDonation(donor1.address);

        console.log("最终合约余额:", ethers.formatEther(finalBalance), "ETH");
        console.log("捐赠者1最终捐赠总额:", ethers.formatEther(finalDonation1), "ETH");

        console.log("\n✅ donate 功能测试完成!");

    } catch (error) {
        console.error("❌ 测试失败:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });