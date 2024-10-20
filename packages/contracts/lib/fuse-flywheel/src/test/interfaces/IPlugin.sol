pragma solidity ^0.8.0;

interface Plugin {
    function allowance(address, address) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function asset() external view returns (address);

    function assetsOf(address user) external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function claimRewards() external;

    function convertToAssets(uint256 shares) external view returns (uint256);

    function convertToShares(uint256 assets) external view returns (uint256);

    function convexBooster() external view returns (address);

    function convexRewards() external view returns (address);

    function decimals() external view returns (uint8);

    function deposit(uint256 assets, address receiver)
        external
        returns (uint256 shares);

    function maxDeposit(address) external view returns (uint256);

    function maxMint(address) external view returns (uint256);

    function maxRedeem(address owner) external view returns (uint256);

    function maxWithdraw(address owner) external view returns (uint256);

    function mint(uint256 shares, address receiver)
        external
        returns (uint256 assets);

    function name() external view returns (string memory);

    function nonces(address) external view returns (uint256);

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function pid() external view returns (uint256);

    function previewDeposit(uint256 assets) external view returns (uint256);

    function previewMint(uint256 shares) external view returns (uint256);

    function previewRedeem(uint256 shares) external view returns (uint256);

    function previewWithdraw(uint256 assets) external view returns (uint256);

    function redeem(
        uint256 shares,
        address receiver,
        address owner
    ) external returns (uint256 assets);

    function rewardDestination() external view returns (address);

    function rewardTokens(uint256) external view returns (address);

    function setRewardDestination(address newDestination) external;

    function symbol() external view returns (string memory);

    function totalAssets() external view returns (uint256);

    function totalSupply() external view returns (uint256);

    function transfer(address to, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    function updateRewardTokens() external;

    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) external returns (uint256 shares);
}
