pragma solidity >=0.8.0;
pragma experimental ABIEncoderV2;

import { EIP20Interface } from "./EIP20Interface.sol";

interface IERC4626 is EIP20Interface {
  /*///////////////////////////////////////////////////////////////
                                Events
    //////////////////////////////////////////////////////////////*/

  event Deposit(address indexed from, address indexed to, uint256 value);

  event Withdraw(address indexed from, address indexed to, uint256 value);

  /*///////////////////////////////////////////////////////////////
                            Mutable Functions
    //////////////////////////////////////////////////////////////*/

  /**
      @notice Deposit a specific amount of underlying tokens.
      @param to The address to receive shares corresponding to the deposit
      @param underlyingAmount The amount of the underlying token to deposit.
      @return shares The shares in the vault credited to `to`
    */
  function deposit(address to, uint256 underlyingAmount) external returns (uint256 shares);

  /**
      @notice Mint an exact amount of shares for a variable amount of underlying tokens.
      @param to The address to receive shares corresponding to the mint.
      @param shareAmount The amount of vault shares to mint.
      @return underlyingAmount The amount of the underlying tokens deposited from the mint call.
    */
  function mint(address to, uint256 shareAmount) external returns (uint256 underlyingAmount);

  /**
      @notice Withdraw a specific amount of underlying tokens.
      @param from The address to burn shares from corresponding to the withdrawal.
      @param to The address to receive underlying corresponding to the withdrawal.
      @param underlyingAmount The amount of the underlying token to withdraw.
      @return shares The shares in the vault burned from sender
    */
  function withdraw(
    address from,
    address to,
    uint256 underlyingAmount
  ) external returns (uint256 shares);

  /**
      @notice Redeem a specific amount of shares for underlying tokens.
      @param from The address to burn shares from corresponding to the redemption.
      @param to The address to receive underlying corresponding to the redemption.
      @param shareAmount The amount of shares to redeem.
      @return value The underlying amount transferred to `to`.
    */
  function redeem(
    address from,
    address to,
    uint256 shareAmount
  ) external returns (uint256 value);

  /*///////////////////////////////////////////////////////////////
                            View Functions
    //////////////////////////////////////////////////////////////*/

  /** 
      @notice The underlying token the Vault accepts.
      @return the ERC20 underlying implementation address.
    */
  function underlying() external view returns (EIP20Interface);

  /** 
      @notice Returns a user's Vault balance in underlying tokens.
      @param user The user to get the underlying balance of.
      @return balance The user's Vault balance in underlying tokens.
    */
  function balanceOfUnderlying(address user) external view returns (uint256 balance);

  /** 
      @notice Calculates the total amount of underlying tokens the Vault manages.
      @return The total amount of underlying tokens the Vault manages.
    */
  function totalUnderlying() external view returns (uint256);

  /** 
      @notice Returns the value in underlying terms of one vault token. 
     */
  function exchangeRate() external view returns (uint256);

  /**
      @notice Returns the amount of vault tokens that would be obtained if depositing a given amount of underlying tokens in a `deposit` call.
      @param underlyingAmount the input amount of underlying tokens
      @return shareAmount the corresponding amount of shares out from a deposit call with `underlyingAmount` in
     */
  function previewDeposit(uint256 underlyingAmount) external view returns (uint256 shareAmount);

  /**
      @notice Returns the amount of underlying tokens that would be deposited if minting a given amount of shares in a `mint` call.
      @param shareAmount the amount of shares from a mint call.
      @return underlyingAmount the amount of underlying tokens corresponding to the mint call
     */
  function previewMint(uint256 shareAmount) external view returns (uint256 underlyingAmount);

  /**
      @notice Returns the amount of vault tokens that would be burned if withdrawing a given amount of underlying tokens in a `withdraw` call.
      @param underlyingAmount the input amount of underlying tokens
      @return shareAmount the corresponding amount of shares out from a withdraw call with `underlyingAmount` in
     */
  function previewWithdraw(uint256 underlyingAmount) external view returns (uint256 shareAmount);

  /**
      @notice Returns the amount of underlying tokens that would be obtained if redeeming a given amount of shares in a `redeem` call.
      @param shareAmount the amount of shares from a redeem call.
      @return underlyingAmount the amount of underlying tokens corresponding to the redeem call
     */
  function previewRedeem(uint256 shareAmount) external view returns (uint256 underlyingAmount);
}
