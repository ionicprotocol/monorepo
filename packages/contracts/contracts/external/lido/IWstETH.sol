// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

/**
 * @title StETH token wrapper with static balances.
 * @dev It's an ERC20 token that represents the account's share of the total
 * supply of stETH tokens. WstETH token's balance only changes on transfers,
 * unlike StETH that is also changed when oracles report staking rewards and
 * penalties. It's a "power user" token for DeFi protocols which don't
 * support rebasable tokens.
 *
 * The contract is also a trustless wrapper that accepts stETH tokens and mints
 * wstETH in return. Then the user unwraps, the contract burns user's wstETH
 * and sends user locked stETH in return.
 *
 * The contract provides the staking shortcut: user can send ETH with regular
 * transfer and get wstETH in return. The contract will send ETH to Lido submit
 * method, staking it and wrapping the received stETH.
 *
 */
interface IWstETH {
  function stETH() external view returns (address);

  /**
   * @notice Get amount of stETH for a one wstETH
   * @return Amount of stETH for 1 wstETH
   */
  function stEthPerToken() external view returns (uint256);

  /**
   * @notice Get amount of wstETH for a one stETH
   * @return Amount of wstETH for a 1 stETH
   */
  function tokensPerStEth() external view returns (uint256);

  /**
   * @notice Exchanges wstETH to stETH
   * @param _wstETHAmount amount of wstETH to uwrap in exchange for stETH
   * @dev Requirements:
   *  - `_wstETHAmount` must be non-zero
   *  - msg.sender must have at least `_wstETHAmount` wstETH.
   * @return Amount of stETH user receives after unwrap
   */
  function unwrap(uint256 _wstETHAmount) external returns (uint256);
}
