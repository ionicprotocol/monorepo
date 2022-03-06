// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

interface ICurveRegistry {
  function get_n_coins(address lp) external view returns (uint256);

  function get_coins(address pool) external view returns (address[8] memory);

  function get_pool_from_lp_token(address lp) external view returns (address);
}
