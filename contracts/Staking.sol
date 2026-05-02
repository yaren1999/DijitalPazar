// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Staking is Ownable, ReentrancyGuard {
    IERC20 public stakingToken; 

    uint256 public rewardRate = 100; 
    
    mapping(address => uint256) public stakedAmount;   
    mapping(address => uint256) public lastUpdateTime; 
    mapping(address => uint256) public rewards;        

    constructor(address _stakingToken) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
    }

      // Ödül hesaplama Fonskiyonu
    
    function earned(address account) public view returns (uint256) {
        uint256 timeElapsed = block.timestamp - lastUpdateTime[account];
        uint256 newReward = (stakedAmount[account] * timeElapsed * rewardRate) / 1e18;
        return rewards[account] + newReward;
    }

     

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Sifir miktar stake edilemez");
        rewards[msg.sender] = earned(msg.sender);
        lastUpdateTime[msg.sender] = block.timestamp;

        stakedAmount[msg.sender] += amount;
        stakingToken.transferFrom(msg.sender, address(this), amount);
    }
    
    // Dağıtım Fonskiyonları

    function withdraw() external nonReentrant {
        uint256 amount = stakedAmount[msg.sender];
        require(amount > 0, "Stake edilen miktar yok");

        uint256 reward = earned(msg.sender);
    
        stakedAmount[msg.sender] = 0;
        rewards[msg.sender] = 0;
        lastUpdateTime[msg.sender] = block.timestamp;

        stakingToken.transfer(msg.sender, amount);
        
        
        if (reward > 0) {
            stakingToken.transfer(msg.sender, reward);
        }
    }

    function claimReward() external nonReentrant {
        uint256 reward = earned(msg.sender);
        require(reward > 0, "Odul birikmemis");

        rewards[msg.sender] = 0;
        lastUpdateTime[msg.sender] = block.timestamp;

        stakingToken.transfer(msg.sender, reward);
    }   
}