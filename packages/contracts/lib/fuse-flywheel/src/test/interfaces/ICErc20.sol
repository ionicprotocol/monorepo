pragma solidity ^0.8.0;

interface CErc20 {
    function PRECISION() external view returns (uint256);

    function _becomeImplementation(bytes memory data) external;

    function _delegateCompLikeTo(address compLikeDelegatee) external;

    function _prepare() external payable;

    function _reduceReserves(uint256 reduceAmount) external returns (uint256);

    function _setAdminFee(uint256 newAdminFeeMantissa)
        external
        returns (uint256);

    function _setImplementationSafe(
        address implementation_,
        bool allowResign,
        bytes memory becomeImplementationData
    ) external;

    function _setInterestRateModel(address newInterestRateModel)
        external
        returns (uint256);

    function _setNameAndSymbol(string memory _name, string memory _symbol)
        external;

    function _setReserveFactor(uint256 newReserveFactorMantissa)
        external
        returns (uint256);

    function _withdrawAdminFees(uint256 withdrawAmount)
        external
        returns (uint256);

    function _withdrawFuseFees(uint256 withdrawAmount)
        external
        returns (uint256);

    function accrualBlockNumber() external view returns (uint256);

    function accrueInterest() external returns (uint256);

    function adminFeeMantissa() external view returns (uint256);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function approve(address _token, address _spender) external;

    function balanceOf(address owner) external view returns (uint256);

    function balanceOfUnderlying(address owner) external returns (uint256);

    function borrow(uint256 borrowAmount) external returns (uint256);

    function borrowBalanceCurrent(address account) external returns (uint256);

    function borrowBalanceStored(address account)
        external
        view
        returns (uint256);

    function borrowIndex() external view returns (uint256);

    function borrowRatePerBlock() external view returns (uint256);

    function claim() external;

    function comptroller() external view returns (address);

    function decimals() external view returns (uint8);

    function exchangeRateCurrent() external returns (uint256);

    function exchangeRateStored() external view returns (uint256);

    function fuseFeeMantissa() external view returns (uint256);

    function getAccountSnapshot(address account)
        external
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256
        );

    function getCash() external view returns (uint256);

    function implementation() external view returns (address);

    function initialize(
        address comptroller_,
        address interestRateModel_,
        uint256 initialExchangeRateMantissa_,
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 reserveFactorMantissa_,
        uint256 adminFeeMantissa_
    ) external;

    function initialize(
        address underlying_,
        address comptroller_,
        address interestRateModel_,
        string memory name_,
        string memory symbol_,
        uint256 reserveFactorMantissa_,
        uint256 adminFeeMantissa_
    ) external;

    function interestRateModel() external view returns (address);

    function isCEther() external view returns (bool);

    function isCToken() external view returns (bool);

    function liquidateBorrow(
        address borrower,
        uint256 repayAmount,
        address cTokenCollateral
    ) external returns (uint256);

    function mint(uint256 mintAmount) external returns (uint256);

    function name() external view returns (string memory);

    function plugin() external view returns (address);

    function protocolSeizeShareMantissa() external view returns (uint256);

    function redeem(uint256 redeemTokens) external returns (uint256);

    function redeemUnderlying(uint256 redeemAmount) external returns (uint256);

    function repayBorrow(uint256 repayAmount) external returns (uint256);

    function repayBorrowBehalf(address borrower, uint256 repayAmount)
        external
        returns (uint256);

    function reserveFactorMantissa() external view returns (uint256);

    function seize(
        address liquidator,
        address borrower,
        uint256 seizeTokens
    ) external returns (uint256);

    function supplyRatePerBlock() external view returns (uint256);

    function symbol() external view returns (string memory);

    function totalAdminFees() external view returns (uint256);

    function totalBorrows() external view returns (uint256);

    function totalBorrowsCurrent() external returns (uint256);

    function totalFuseFees() external view returns (uint256);

    function totalReserves() external view returns (uint256);

    function totalSupply() external view returns (uint256);

    function transfer(address dst, uint256 amount) external returns (bool);

    function transferFrom(
        address src,
        address dst,
        uint256 amount
    ) external returns (bool);

    function underlying() external view returns (address);
}
