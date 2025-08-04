// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BeggingContract {
    address public owner;
    mapping(address => uint256) public donations;
    address[] public donators;
    uint256 public totalDonations;
    
    event DonationReceived(address indexed donator, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed owner, uint256 amount, uint256 timestamp);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    modifier nonReentrant() {
        require(!_locked, "ReentrancyGuard: reentrant call");
        _locked = true;
        _;
        _locked = false;
    }
    
    bool private _locked;
    
    constructor() {
        owner = msg.sender;
        _locked = false;
    }
    
    function donate() public payable nonReentrant {
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        if (donations[msg.sender] == 0) {
            donators.push(msg.sender);
        }
        
        donations[msg.sender] += msg.value;
        totalDonations += msg.value;
        
        emit DonationReceived(msg.sender, msg.value, block.timestamp);
    }
    
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit Withdrawal(owner, balance, block.timestamp);
    }
    
    function getDonation(address donator) external view returns (uint256) {
        return donations[donator];
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getDonatorCount() external view returns (uint256) {
        return donators.length;
    }
    
    function getAllDonators() external view returns (address[] memory) {
        return donators;
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
    
    receive() external payable {
        donate();
    }
    
    fallback() external payable {
        donate();
    }
}