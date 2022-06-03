// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract Cryptobikes is ERC20, Pausable, Ownable, ERC20Permit {

    struct Wallet {
        uint months;
        uint supplyMonth;
        uint unlockIn;
    }

    struct Withdrawal {
        uint value;
    }

    uint private created;
    uint private constant oneMonth = 60 * 60 * 24 * 30;
    mapping(address => Wallet) private wallets;
    mapping(address => Withdrawal[]) private withdrawals;
    address private walletPrivateSale;
    address private walletPlayToEarn;
    mapping(address => uint) private marked;

    constructor(
        address advisor,
        address coreTeam,
        address marketing,
        address development,
        address privateSale,
        address dexLiquidity,
        address playToEarn) ERC20("Cryptobikes", "CTB") ERC20Permit("Cryptobikes") {

        created = block.timestamp;
        walletPrivateSale = privateSale;
        walletPlayToEarn = playToEarn;

        wallets[advisor] = Wallet(36, 222222 * 10 ** decimals(), block.timestamp + oneMonth * 36);
        wallets[coreTeam] = Wallet(36, 333333 * 10 ** decimals(), block.timestamp + oneMonth * 36);
        wallets[marketing] = Wallet(12, 500000 * 10 ** decimals(), block.timestamp + oneMonth * 12);
        wallets[development] = Wallet(12, 750000 * 10 ** decimals(), block.timestamp + oneMonth * 12);

        _mint(advisor, 8000000 * 10 ** decimals());
        _mint(coreTeam, 12000000 * 10 ** decimals());
        _mint(marketing, 6000000 * 10 ** decimals());
        _mint(development, 9000000 * 10 ** decimals());
        _mint(privateSale, 5750000 * 10 ** decimals());
        _mint(dexLiquidity, 5750000 * 10 ** decimals());
        _mint(playToEarn, 53500000 * 10 ** decimals());
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function checkWalletRules(address owner, uint value) private returns(bool){
        Wallet memory wallet = wallets[owner];

        if (wallet.months == 0) {
            return true;
        }

        if (block.timestamp > wallet.unlockIn) {
            return true;
        }

        uint months = created;
        uint totalAvailable = 0;
        uint totalWalletWithdrawals = 0;
        Withdrawal[] memory walletWithdrawals = withdrawals[owner];

        while (months < block.timestamp) {
            months += oneMonth;
            totalAvailable += wallet.supplyMonth;
        }

        for(uint i = 0; i < walletWithdrawals.length; i++) {
            totalWalletWithdrawals += walletWithdrawals[i].value;
        }

        totalWalletWithdrawals += value;

        if (totalWalletWithdrawals <= totalAvailable) {
            withdrawals[owner].push(Withdrawal(value));
            return true;
        }

        return false;
    }

    function taggedTokensController(address from, address to, uint value) private returns(bool) {
        if (from == address(0)) {
            return true;
        }

        if (from == walletPrivateSale) {
            marked[to] += value;
            return true;
        }

        if (to == walletPlayToEarn && marked[from] >= value) {
            marked[from] -= value;
            return true;
        }

        if (to == walletPlayToEarn && marked[from] < value) {
            marked[from] = 0;
            return true;
        }

        if (to != walletPlayToEarn && balanceOf(from) - marked[from] < value) {
            return false;
        }

        return true;
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        require(checkWalletRules(from, amount), 'Permission denied, wallets controlled');
        require(taggedTokensController(from, to, amount), 'Permission denied, marked tokens');

        super._beforeTokenTransfer(from, to, amount);
    }
}
