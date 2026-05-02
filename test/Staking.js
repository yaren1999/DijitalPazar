const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Staking Kontratı", function () {
  let Token, token, Staking, staking;
  let owner, user1, user2;
  const rewardRate = ethers.parseUnits("100", 18); 

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    Token = await ethers.getContractFactory("SecureToken");
    token = await Token.deploy(ethers.parseUnits("1000000", 18));
    await token.waitForDeployment();

    Staking = await ethers.getContractFactory("Staking");
    staking = await Staking.deploy(await token.getAddress());
    await staking.waitForDeployment();

    await token.transfer(user1.address, ethers.parseUnits("1000", 18));
    await token.connect(user1).approve(await staking.getAddress(), ethers.parseUnits("1000", 18));
    await token.transfer(await staking.getAddress(), ethers.parseUnits("10000", 18));
  });

  it("Zaman geçtikçe ödül doğru hesaplanmalı", async function () {
    const stakeAmount = ethers.parseUnits("100", 18);
    await staking.connect(user1).stake(stakeAmount);
    await time.increase(3600); 

    const expectedReward = (BigInt(stakeAmount) * BigInt(3600) * BigInt(100)) / BigInt(10 ** 18);
    const actualReward = await staking.earned(user1.address);

    expect(actualReward).to.be.closeTo(ethers.parseUnits(expectedReward.toString(), 0), ethers.parseUnits("1", 15));
  });

  it("Kullanıcı parasını ve ödülünü çekebilmeli (withdraw)", async function () {
    const stakeAmount = ethers.parseUnits("100", 18);
    await staking.connect(user1).stake(stakeAmount);
    await time.increase(3600);
    
    await staking.connect(user1).withdraw();
    expect(await staking.stakedAmount(user1.address)).to.equal(0);
    expect(await token.balanceOf(user1.address)).to.be.gt(ethers.parseUnits("900", 18));
  });

  it("Kullanıcı sadece ödülünü çekebilmeli (claimReward)", async function () {
    const stakeAmount = ethers.parseUnits("100", 18);
    await staking.connect(user1).stake(stakeAmount);
    await time.increase(3600);
    
    await staking.connect(user1).claimReward();
    expect(await staking.stakedAmount(user1.address)).to.equal(stakeAmount);
    expect(await token.balanceOf(user1.address)).to.be.gt(ethers.parseUnits("900", 18));
  });
});