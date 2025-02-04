// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

import "@openzeppelin-contracts-upgradeable/contracts/proxy/utils/Initializable.sol";
import "./interfaces/IVoter.sol";
import "../PoolDirectory.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";
import { ComptrollerExtensionInterface } from "../compound/ComptrollerInterface.sol";

contract VoterLens is Initializable {
  struct BribeInfo {
    address market;
    address bribeSupply;
    address bribeBorrow;
  }

  address voter;
  PoolDirectory poolDirectory;

  function initialize(address _voter, PoolDirectory _poolDirectory) public initializer {
    voter = _voter;
    poolDirectory = _poolDirectory;
  }

  function getAllBribes() external view returns (BribeInfo[] memory _bribeInfo) {
    uint256 count = 0;
    uint256 totalMarketsLength = 0;
    (, PoolDirectory.Pool[] memory activePools) = poolDirectory.getActivePools();

    for (uint256 i = 0; i < activePools.length; i++) {
      ComptrollerExtensionInterface comptroller = ComptrollerExtensionInterface(activePools[i].comptroller);
      ICErc20[] memory markets = comptroller.getAllMarkets();
      totalMarketsLength += markets.length;
    }

    _bribeInfo = new BribeInfo[](totalMarketsLength);

    for (uint256 i = 0; i < activePools.length; i++) {
      ComptrollerExtensionInterface comptroller = ComptrollerExtensionInterface(activePools[i].comptroller);
      ICErc20[] memory markets = comptroller.getAllMarkets();

      for (uint256 j = 0; j < markets.length; j++) {
        address rewardAccumulatorSupply = IVoterView(voter).marketToRewardAccumulators(
          address(markets[j]),
          IVoter.MarketSide.Supply
        );
        address rewardAccumulatorBorrow = IVoterView(voter).marketToRewardAccumulators(
          address(markets[j]),
          IVoter.MarketSide.Borrow
        );

        address bribeSupply = IVoterView(voter).rewardAccumulatorToBribe(rewardAccumulatorSupply);
        address bribeBorrow = IVoterView(voter).rewardAccumulatorToBribe(rewardAccumulatorBorrow);

        _bribeInfo[count] = BribeInfo({
          market: address(markets[j]),
          bribeSupply: bribeSupply,
          bribeBorrow: bribeBorrow
        });
        count++;
      }
    }
  }
}

interface IVoterView {
  function rewardAccumulatorToBribe(address rewardAccumulator) external view returns (address);
  function marketToRewardAccumulators(address market, IVoter.MarketSide marketSide) external view returns (address);
}
