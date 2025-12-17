// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AccessRegistry {
    address public owner;
    mapping(address => bool) public web3Allowlist;

    event AccessGranted(address indexed user);
    event AccessRevoked(address indexed user);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function grantAccess(address user) external onlyOwner {
        web3Allowlist[user] = true;
        emit AccessGranted(user);
    }

    function revokeAccess(address user) external onlyOwner {
        web3Allowlist[user] = false;
        emit AccessRevoked(user);
    }

    function hasAccess(address user) external view returns (bool) {
        return web3Allowlist[user];
    }
}
