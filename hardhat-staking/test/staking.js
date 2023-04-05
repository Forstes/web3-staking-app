const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StakingContract", function () {
  let stakingContract;
  let rewardToken;
  let mockToken;
  let owner;
  let user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    // Deploy a mock token for testing
    const MockToken = await ethers.getContractFactory("MockToken");
    mockToken = await MockToken.deploy("Mock Token", "MOCK");
    await mockToken.deployed();
    // Mint some tokens to user1 for testing
    await mockToken.connect(user1).mint(user1.address, 50);

    const RewardToken = await ethers.getContractFactory("MockToken");
    rewardToken = await RewardToken.deploy("Reward Token", "REW");
    await rewardToken.deployed();
    await rewardToken.connect(owner).mint(owner.address, 100000);

    const StakingContract = await ethers.getContractFactory("StakingContract");
    stakingContract = await StakingContract.deploy(rewardToken.address, 100);
    await stakingContract.deployed();
  });

  it("should allow a user to stake tokens", async function () {
    await mockToken.connect(user1).approve(stakingContract.address, 50);
    await stakingContract.connect(user1).stake(mockToken.address, 50);

    expect(await mockToken.balanceOf(stakingContract.address)).to.equal(50);
    expect(await stakingContract.stakedBalances(user1.address)).to.equal(50);
    expect(await stakingContract.totalStaked()).to.equal(50);
  });

  it("should not allow a user to stake zero tokens", async function () {
    await expect(stakingContract.connect(user1).stake(mockToken.address, 0)).to.be.revertedWith("Amount must be greater than zero");
  });

  it("should not allow a user to unstake if they have no tokens staked", async function () {
    await expect(stakingContract.connect(user1).unstake(mockToken.address)).to.be.revertedWith("No reward accumulated");
  });

  it("should allow a user to unstake tokens and receive a reward", async function () {

    // Fund contract
    await rewardToken.connect(owner).transfer(stakingContract.address, 10000);

    await mockToken.connect(user1).approve(stakingContract.address, 50);
    await stakingContract.connect(user1).stake(mockToken.address, 50);

    // Increase time by 1 day to simulate staking for 1 min
    await ethers.provider.send("evm_increaseTime", [60]);

    await stakingContract.connect(user1).unstake(mockToken.address);

    expect(await mockToken.balanceOf(stakingContract.address)).to.equal(0);
    expect(await mockToken.balanceOf(user1.address)).to.equal(50);
    expect(await rewardToken.balanceOf(user1.address)).to.above(0);
    expect(await stakingContract.stakedBalances(user1.address)).to.equal(0);
    expect(await stakingContract.totalStaked()).to.equal(0);
  });

  it("should allow the owner to add reward tokens", async function () {
    await rewardToken.connect(owner).approve(stakingContract.address, 1000);
    await stakingContract.connect(owner).addRewards(1000);

    expect(await rewardToken.balanceOf(stakingContract.address)).to.equal(1000);
  });
});
