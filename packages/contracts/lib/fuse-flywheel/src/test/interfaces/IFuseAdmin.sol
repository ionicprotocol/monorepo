pragma solidity ^0.8.0;

interface FuseAdmin {
    function _callPool(address[] memory targets, bytes[] memory data) external;

    function _callPool(address[] memory targets, bytes memory data) external;

    function _editCErc20DelegateWhitelist(
        address[] memory oldImplementations,
        address[] memory newImplementations,
        bool[] memory allowResign,
        bool[] memory statuses
    ) external;

    function _editCEtherDelegateWhitelist(
        address[] memory oldImplementations,
        address[] memory newImplementations,
        bool[] memory allowResign,
        bool[] memory statuses
    ) external;

    function _editComptrollerImplementationWhitelist(
        address[] memory oldImplementations,
        address[] memory newImplementations,
        bool[] memory statuses
    ) external;

    function _latestCErc20Delegate(address)
        external
        view
        returns (
            address implementation,
            bool allowResign,
            bytes memory becomeImplementationData
        );

    function _latestCEtherDelegate(address)
        external
        view
        returns (
            address implementation,
            bool allowResign,
            bytes memory becomeImplementationData
        );

    function _setCustomInterestFeeRate(address comptroller, int256 rate)
        external;

    function _setDefaultInterestFeeRate(uint256 _defaultInterestFeeRate)
        external;

    function _setLatestCErc20Delegate(
        address oldImplementation,
        address newImplementation,
        bool allowResign,
        bytes memory becomeImplementationData
    ) external;

    function _setLatestCEtherDelegate(
        address oldImplementation,
        address newImplementation,
        bool allowResign,
        bytes memory becomeImplementationData
    ) external;

    function _setLatestComptrollerImplementation(
        address oldImplementation,
        address newImplementation
    ) external;

    function _setPoolLimits(
        uint256 _minBorrowEth,
        uint256 _maxSupplyEth,
        uint256 _maxUtilizationRate
    ) external;

    function _withdrawAssets(address erc20Contract) external;

    function cErc20DelegateWhitelist(
        address,
        address,
        bool
    ) external view returns (bool);

    function cEtherDelegateWhitelist(
        address,
        address,
        bool
    ) external view returns (bool);

    function comptrollerImplementationWhitelist(address, address)
        external
        view
        returns (bool);

    function customInterestFeeRates(address) external view returns (int256);

    function defaultInterestFeeRate() external view returns (uint256);

    function deployCErc20(bytes memory constructorData)
        external
        returns (address);

    function deployCEther(bytes memory constructorData)
        external
        returns (address);

    function initialize(uint256 _defaultInterestFeeRate) external;

    function interestFeeRate() external view returns (uint256);

    function latestCErc20Delegate(address oldImplementation)
        external
        view
        returns (
            address,
            bool,
            bytes memory
        );

    function latestCEtherDelegate(address oldImplementation)
        external
        view
        returns (
            address,
            bool,
            bytes memory
        );

    function latestComptrollerImplementation(address oldImplementation)
        external
        view
        returns (address);

    function maxSupplyEth() external view returns (uint256);

    function maxUtilizationRate() external view returns (uint256);

    function minBorrowEth() external view returns (uint256);

    function owner() external view returns (address);

    function renounceOwnership() external;

    function transferOwnership(address newOwner) external;
}
