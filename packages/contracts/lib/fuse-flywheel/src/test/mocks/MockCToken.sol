// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.10;

import {MockERC20} from "solmate/test/utils/mocks/MockERC20.sol";
import {CToken} from "../../external/CToken.sol";
import {InterestRateModel} from "libcompound/interfaces/InterestRateModel.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";

interface ICToken {
    function underlying() external view returns (ERC20);

    function comptroller() external view returns (address);

    function adminFeeMantissa() external view returns (uint256);

    function fuseFeeMantissa() external view returns (uint256);

    function reserveFactorMantissa() external view returns (uint256);

    function totalReserves() external view returns (uint256);

    function totalAdminFees() external view returns (uint256);

    function totalFuseFees() external view returns (uint256);

    function isCToken() external view returns (bool);

    function isCEther() external view returns (bool);

    function balanceOfUnderlying(address owner) external returns (uint256);

    function totalBorrows() external view returns (uint256);

    function interestRateModel() external view returns (InterestRateModel);

    function borrowBalanceCurrent(address account) external returns (uint256);

    function borrowBalanceStored(address account)
        external
        view
        returns (uint256);

    function exchangeRateCurrent() external view returns (uint256);

    function exchangeRateStored() external view returns (uint256);

    function getCash() external view returns (uint256);

    function accrueInterest() external returns (uint256);

    function redeem(uint256 redeemTokens) external returns (uint256);

    function redeemUnderlying(uint256 redeemAmount) external returns (uint256);

    function initialExchangeRateMantissa() external view returns (uint256);

    function repayBorrow(uint256) external returns (uint256);

    function repayBorrowBehalf(address, uint256) external returns (uint256);

    function accrualBlockNumber() external view returns (uint256);

    function borrowIndex() external view returns (uint256);

    function borrow(uint256 borrowAmount) external returns (uint256);
}

contract MockInterestRateModel is InterestRateModel {
    function getBorrowRate(
        uint256,
        uint256,
        uint256
    ) external view override returns (uint256) {
        return 0;
    }

    function getSupplyRate(
        uint256,
        uint256,
        uint256,
        uint256
    ) external view override returns (uint256) {
        return 0;
    }
}

contract MockUnitroller {
    function supplyCaps(address cToken) external view returns (uint256) {
        return 100e18;
    }

    function mintGuardianPaused(address cToken) external view returns (bool) {
        return false;
    }

    function borrowGuardianPaused(address cToken) external view returns (bool) {
        return false;
    }
}

contract MockCToken is MockERC20, CToken {
    MockERC20 public token;
    bool public error;
    bool public isCEther;
    InterestRateModel public irm;
    address public override comptroller;
    mapping(address => uint256) internal borrowBalances;
    uint256 internal _totalBorrowed;

    uint256 private constant ONE = 1e18;
    uint256 private constant EXCHANGE_RATE_SCALE = 1e18;
    uint256 public effectiveExchangeRate = 2e18;

    uint256 public timeCreated;

    constructor(address _token, bool _isCEther) MockERC20("token", "TKN", 18) {
        token = MockERC20(_token);
        isCEther = _isCEther;
        irm = new MockInterestRateModel();
        comptroller = address(new MockUnitroller());
        timeCreated = block.timestamp;
    }

    function setError(bool _error) external {
        error = _error;
    }

    function setEffectiveExchangeRate(uint256 _effectiveExchangeRate) external {
        effectiveExchangeRate = _effectiveExchangeRate;
    }

    function isCToken() external pure returns (bool) {
        return true;
    }

    function underlying() external view override returns (ERC20) {
        return ERC20(address(token));
    }

    function balanceOfUnderlying(address)
        external
        view
        override
        returns (uint256)
    {
        return 0;
    }

    function mint() external payable {
        _mint(
            msg.sender,
            (msg.value * EXCHANGE_RATE_SCALE) / effectiveExchangeRate
        );
    }

    function mint(uint256 amount) external override returns (uint256) {
        token.transferFrom(msg.sender, address(this), amount);
        _mint(
            msg.sender,
            (amount * EXCHANGE_RATE_SCALE) / effectiveExchangeRate
        );
        return error ? 1 : 0;
    }

    function redeem(uint256 redeemTokens) external returns (uint256) {
        _burn(msg.sender, redeemTokens);
        uint256 redeemAmount = (redeemTokens * effectiveExchangeRate) /
            EXCHANGE_RATE_SCALE;
        if (address(this).balance >= redeemAmount) {
            payable(msg.sender).transfer(redeemAmount);
        } else {
            token.transfer(msg.sender, redeemAmount);
        }
        return error ? 1 : 0;
    }

    function redeemUnderlying(uint256 redeemAmount)
        external
        override
        returns (uint256)
    {
        _burn(
            msg.sender,
            (redeemAmount * EXCHANGE_RATE_SCALE) / effectiveExchangeRate
        );
        if (address(this).balance >= redeemAmount) {
            payable(msg.sender).transfer(redeemAmount);
        } else {
            token.transfer(msg.sender, redeemAmount);
        }
        return error ? 1 : 0;
    }

    function exchangeRateStored() external view override returns (uint256) {
        return
            (EXCHANGE_RATE_SCALE * effectiveExchangeRate) / EXCHANGE_RATE_SCALE; // 2:1
    }

    function exchangeRateCurrent() external view override returns (uint256) {
        return
            (EXCHANGE_RATE_SCALE * effectiveExchangeRate) / EXCHANGE_RATE_SCALE; // 2:1
    }

    function getCash() external view override returns (uint256) {
        return token.balanceOf(address(this));
    }

    function totalReserves() external pure override returns (uint256) {
        return 0;
    }

    function totalFuseFees() external view override returns (uint256) {
        return 0;
    }

    function totalAdminFees() external view override returns (uint256) {
        return 0;
    }

    function interestRateModel()
        external
        view
        override
        returns (InterestRateModel)
    {
        return irm;
    }

    function reserveFactorMantissa() external view override returns (uint256) {
        return 0;
    }

    function fuseFeeMantissa() external view override returns (uint256) {
        return 0;
    }

    function adminFeeMantissa() external view override returns (uint256) {
        return 0;
    }

    function initialExchangeRateMantissa()
        external
        view
        override
        returns (uint256)
    {
        return 0;
    }

    function repayBorrow(uint256) external override returns (uint256) {
        return 0;
    }

    function repayBorrowBehalf(address, uint256)
        external
        override
        returns (uint256)
    {
        return 0;
    }

    function borrowBalanceCurrent(address) external override returns (uint256) {
        return 0;
    }

    function totalBorrows() external view override returns (uint256) {
        return _totalBorrowed;
    }

    function borrowBalanceStored(address account)
        external
        view
        override
        returns (uint256)
    {
        return borrowBalances[account];
    }

    function borrow(uint256 borrowAmount) external override returns (uint256) {
        borrowBalances[msg.sender] += borrowAmount;
        _totalBorrowed += borrowAmount;

        return 0;
    }

    function accrualBlockNumber() external view override returns (uint256) {
        return block.number;
    }

    function accrueInterest() external returns (uint256) {
        return 0;
    }

    function borrowIndex() external view override returns (uint256) {
        return 1e18;
    }
}
