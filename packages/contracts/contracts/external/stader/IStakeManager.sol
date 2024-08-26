//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

interface IStakeManager {
  function deposit() external payable;

  function getTotalPooledBnb() external view returns (uint256);

  function getContracts()
    external
    view
    returns (
      address _manager,
      address _bnbX,
      address _tokenHub,
      address _bcDepositWallet
    );

  function getExtraBnbInContract() external view returns (uint256 _extraBnb);

  function convertBnbToBnbX(uint256 _amount) external view returns (uint256);

  function convertBnbXToBnb(uint256 _amountInBnbX) external view returns (uint256);
}
