// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    uint256 public totalCreditPoints;
    string public userName;
    string public college;
    string public course;
    string public branch;
    uint256 public dateOfOpening;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        totalCreditPoints = 0;
        dateOfOpening = block.timestamp;
    }

    function getBalance() public view returns(uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;
        balance += _amount;
        emit Deposit(_amount);
        if (_amount > 100 || totalCreditPoints >= 100) {
            totalCreditPoints += 100;
        }
        assert(balance == _previousBalance + _amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }
        uint _previousBalance = balance;
        balance -= _withdrawAmount;
        emit Withdraw(_withdrawAmount);
        if (_withdrawAmount > 100 || totalCreditPoints >= 100) {
            totalCreditPoints += 100;
        }
        assert(balance == (_previousBalance - _withdrawAmount));
    }

    function getCreditPoints() public view returns (uint256) {
        if (balance >= 100 || totalCreditPoints >= 100) {
            return 100;
        } else {
            return 0;
        }
    }

    function getUserInfo() public view returns (string memory, string memory, string memory, string memory, uint256) {
        return (userName, college, course, branch, dateOfOpening);
    }

    function setUserInfo(string memory _userName, string memory _college, string memory _course, string memory _branch) public {
        userName = _userName;
        college = _college;
        course = _course;
        branch = _branch;
    }
}
