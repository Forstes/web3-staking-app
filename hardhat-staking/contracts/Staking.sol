// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakingContract is Ownable {
    address public rewardToken;
    uint256 public rewardRate;
    uint256 public totalStaked;
    mapping(address => uint256) public stakedBalances;
    mapping(address => uint256) public stakingStarts;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardAdded(uint256 amount);

    constructor(address _rewardToken, uint256 _rewardRate) {
        rewardToken = _rewardToken;
        rewardRate = _rewardRate;
    }

    function stake(address stakedToken, uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");

        // Transfer the staked tokens from the user to the contract
        require(
            IERC20(stakedToken).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        // Set the staking start time for the user if it hasn't been set already
        if (stakingStarts[msg.sender] == 0) {
            stakingStarts[msg.sender] = block.timestamp;
        }

        // Update the user's staked balance and the total staked
        stakedBalances[msg.sender] += amount;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    function unstake(address stakedToken) external {
        uint256 reward = calculateReward();

        require(stakedBalances[msg.sender] > 0, "No reward accumulated");

        // Transfer the staked tokens back to the user
        require(
            IERC20(stakedToken).transfer(
                msg.sender,
                stakedBalances[msg.sender]
            ),
            "Transfer failed"
        );

        // Transfer the reward tokens to the user
        require(
            IERC20(rewardToken).transfer(msg.sender, reward),
            "Transfer failed"
        );

        // Update the total staked and the user's staked and reward balances
        totalStaked = totalStaked - stakedBalances[msg.sender];
        stakedBalances[msg.sender] = 0;
        stakingStarts[msg.sender] = 0;

        emit Unstaked(msg.sender, stakedBalances[msg.sender]);
    }

    function calculateReward() private view returns (uint256) {
        // Calculate the user's reward based on their staked balance and the staking duration
        uint256 rewardPerSecond = (rewardRate * stakedBalances[msg.sender]) /
            (totalStaked > 0 ? totalStaked : 1);
        uint256 stakingTime = block.timestamp - stakingStarts[msg.sender];
        uint256 reward = rewardPerSecond * stakingTime;
        return reward;
    }

    function addRewards(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");

        // Transfer the reward tokens from the user to the contract
        require(
            IERC20(rewardToken).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        if (totalStaked > 0) {
            // Update the reward rate based on the new reward amount
            rewardRate += amount / totalStaked;
        }

        emit RewardAdded(amount);
    }
}
