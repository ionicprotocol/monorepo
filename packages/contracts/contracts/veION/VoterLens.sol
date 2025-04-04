// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

import "@openzeppelin-contracts-upgradeable/contracts/proxy/utils/Initializable.sol";
import "./interfaces/IVoter.sol";
import "../PoolDirectory.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";
import { ComptrollerExtensionInterface } from "../compound/ComptrollerInterface.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import { Ownable2StepUpgradeable } from "@openzeppelin-contracts-upgradeable/contracts/access/Ownable2StepUpgradeable.sol";
import { veIONSecondExtension } from "./veIONSecondExtension.sol";
import { Voter } from "./Voter.sol";

contract VoterLens is Initializable, Ownable2StepUpgradeable {
  struct BribeInfo {
    address market;
    address bribeSupply;
    address bribeBorrow;
  }

  struct MarketVoteInfo {
    address market;
    IVoter.MarketSide side;
    uint256 votes;
    uint256 votesValueInEth;
  }

  struct IncentiveInfo {
    address market;
    address bribeSupply;
    address[] rewardsSupply;
    uint256[] rewardsSupplyAmounts;
    uint256[] rewardsSupplyETHValues;
    address bribeBorrow;
    address[] rewardsBorrow;
    uint256[] rewardsBorrowAmounts;
    uint256[] rewardsBorrowETHValues;
  }

  struct MarketVoteInfo {
    address market;
    IVoter.MarketSide side;
    uint256 votes;
    uint256 votesValueInEth;
  }

  address voter;
  PoolDirectory poolDirectory;
  IMasterPriceOracle mpo;
  uint256 constant PRECISION = 1e18;
  address veIONAddress;

  function initialize(address _voter, PoolDirectory _poolDirectory) public initializer {
    voter = _voter;
    poolDirectory = _poolDirectory;
    __Ownable2Step_init();
  }

  function getAllBribes() public view returns (BribeInfo[] memory _bribeInfo) {
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

  function getAllIncentivesForBribes() external view returns (IncentiveInfo[] memory _incentiveInfo) {
    BribeInfo[] memory _bribeInfo = getAllBribes();
    _incentiveInfo = new IncentiveInfo[](_bribeInfo.length);
    for (uint256 i; i < _bribeInfo.length; i++) {
      _incentiveInfo[i].market = _bribeInfo[i].market;
      if (_bribeInfo[i].bribeSupply != address(0)) {
        _incentiveInfo[i].bribeSupply = _bribeInfo[i].bribeSupply;
        uint256 supplyRewardsLength = IBribeRewardsView(_bribeInfo[i].bribeSupply).rewardsListLength();
        _incentiveInfo[i].rewardsSupply = new address[](supplyRewardsLength);
        _incentiveInfo[i].rewardsSupplyAmounts = new uint256[](supplyRewardsLength);
        _incentiveInfo[i].rewardsSupplyETHValues = new uint256[](supplyRewardsLength);
        for (uint256 j; j < supplyRewardsLength; j++) {
          _incentiveInfo[i].rewardsSupply[j] = IBribeRewardsView(_bribeInfo[i].bribeSupply).rewards(j);
          _incentiveInfo[i].rewardsSupplyAmounts[j] = ERC20(_incentiveInfo[i].rewardsSupply[j]).balanceOf(
            _bribeInfo[i].bribeSupply
          );

          uint256 tokenPrice = mpo.price(_incentiveInfo[i].rewardsSupply[j]);

          if (tokenPrice != 0) {
            uint256 decimals = ERC20(_incentiveInfo[i].rewardsSupply[j]).decimals();
            _incentiveInfo[i].rewardsSupplyETHValues[j] =
              (_incentiveInfo[i].rewardsSupplyAmounts[j] * 10 ** (18 - decimals) * tokenPrice) /
              PRECISION;
          }
        }
      }

      if (_bribeInfo[i].bribeBorrow != address(0)) {
        _incentiveInfo[i].bribeBorrow = _bribeInfo[i].bribeBorrow;
        uint256 borrowRewardsLength = IBribeRewardsView(_bribeInfo[i].bribeBorrow).rewardsListLength();
        _incentiveInfo[i].rewardsBorrow = new address[](borrowRewardsLength);
        _incentiveInfo[i].rewardsBorrowAmounts = new uint256[](borrowRewardsLength);
        _incentiveInfo[i].rewardsBorrowETHValues = new uint256[](borrowRewardsLength);
        for (uint256 j; j < borrowRewardsLength; j++) {
          _incentiveInfo[i].rewardsBorrow[j] = IBribeRewardsView(_bribeInfo[i].bribeBorrow).rewards(j);
          _incentiveInfo[i].rewardsBorrowAmounts[j] = ERC20(_incentiveInfo[i].rewardsBorrow[j]).balanceOf(
            _bribeInfo[i].bribeBorrow
          );

          uint256 tokenPrice = mpo.price(_incentiveInfo[i].rewardsBorrow[j]);

          if (tokenPrice != 0) {
            uint256 decimals = (ERC20(_incentiveInfo[i].rewardsBorrow[j])).decimals();
            _incentiveInfo[i].rewardsBorrowETHValues[j] =
              (_incentiveInfo[i].rewardsBorrowAmounts[j] * 10 ** (18 - decimals) * tokenPrice) /
              PRECISION;
          }
        }
      }
    }
  }

  struct UserBribes {
    uint256 tokenId;
    address market;
    address bribe;
    address reward;
    uint256 earned;
  }

  struct UserBribeVars {
    uint256[] userTokens;
    address[] lpTokens;
    uint256 count;
    IVoter.VoteDetails voteDetails;
    address rewardAccumulator;
    address bribeRewards;
    uint256 bribesLength;
    address reward;
    uint256 rewardEarned;
  }

  function getUserBribeRewards(address _user) external view returns (UserBribes[] memory _userBribes) {
    UserBribeVars memory vars;
    vars.userTokens = veIONSecondExtension(veIONAddress).getOwnedTokenIds(_user);
    vars.lpTokens = Voter(voter).getAllLpRewardTokens();
    vars.count = 0;

    for (uint256 i = 0; i < vars.userTokens.length; i++) {
      for (uint256 j = 0; j < vars.lpTokens.length; j++) {
        vars.voteDetails = IVoterView(voter).getVoteDetails(vars.userTokens[i], vars.lpTokens[j]);
        for (uint256 k; k < vars.voteDetails.marketVotes.length; k++) {
          vars.rewardAccumulator = IVoterView(voter).marketToRewardAccumulators(
            vars.voteDetails.marketVotes[k],
            vars.voteDetails.marketVoteSides[k]
          );
          vars.bribeRewards = IVoterView(voter).rewardAccumulatorToBribe(vars.rewardAccumulator);
          vars.bribesLength = IBribeRewardsView(vars.bribeRewards).rewardsListLength();
          for (uint256 x; x < vars.bribesLength; x++) {
            vars.reward = IBribeRewardsView(vars.bribeRewards).rewards(x);
            vars.rewardEarned = IBribeRewardsView(vars.bribeRewards).earned(vars.reward, vars.userTokens[i]);
            if (vars.rewardEarned != 0) vars.count++;
          }
        }
      }
    }

    _userBribes = new UserBribes[](vars.count);
    vars.count = 0;
    for (uint256 i = 0; i < vars.userTokens.length; i++) {
      for (uint256 j = 0; j < vars.lpTokens.length; j++) {
        vars.voteDetails = IVoterView(voter).getVoteDetails(vars.userTokens[i], vars.lpTokens[j]);
        for (uint256 k; k < vars.voteDetails.marketVotes.length; k++) {
          vars.rewardAccumulator = IVoterView(voter).marketToRewardAccumulators(
            vars.voteDetails.marketVotes[k],
            vars.voteDetails.marketVoteSides[k]
          );
          vars.bribeRewards = IVoterView(voter).rewardAccumulatorToBribe(vars.rewardAccumulator);
          vars.bribesLength = IBribeRewardsView(vars.bribeRewards).rewardsListLength();
          for (uint256 x; x < vars.bribesLength; x++) {
            vars.reward = IBribeRewardsView(vars.bribeRewards).rewards(x);
            vars.rewardEarned = IBribeRewardsView(vars.bribeRewards).earned(vars.reward, vars.userTokens[i]);
            if (vars.rewardEarned != 0) {
              _userBribes[vars.count].tokenId = vars.userTokens[i];
              _userBribes[vars.count].market = vars.voteDetails.marketVotes[k];
              _userBribes[vars.count].bribe = vars.bribeRewards;
              _userBribes[vars.count].reward = vars.reward;
              _userBribes[vars.count].earned = vars.rewardEarned;

              vars.count++;
            }
          }
        }
      }
    }
  }

  function getAllMarketVotes(address lp) external view returns (MarketVoteInfo[] memory _marketVoteInfo) {
    uint256 marketsLength = IVoter(voter).marketsLength();
    _marketVoteInfo = new MarketVoteInfo[](marketsLength);
    for (uint256 i; i < marketsLength; i++) {
      IVoter.Market memory _market = IVoterView(voter).markets(i);
      _marketVoteInfo[i].market = _market.marketAddress;
      _marketVoteInfo[i].side = _market.side;
      _marketVoteInfo[i].votes = IVoterView(voter).weights(_market.marketAddress, _market.side, lp);

      _marketVoteInfo[i].votesValueInEth =
        (_marketVoteInfo[i].votes * 10 ** (18 - ERC20(lp).decimals()) * mpo.price(lp)) /
        PRECISION;
    }
  }

  function setMasterPriceOracle(address _masterPriceOracle) external onlyOwner {
    mpo = IMasterPriceOracle(_masterPriceOracle);
  }

  function setVeIONAddress(address _veIONAddress) external onlyOwner {
    veIONAddress = _veIONAddress;
  }
}

interface IVoterView {
  function rewardAccumulatorToBribe(address rewardAccumulator) external view returns (address);
  function marketToRewardAccumulators(address market, IVoter.MarketSide marketSide) external view returns (address);
  function marketVote(uint256 tokenId, address lpAsset) external view returns (address[] memory);
  function marketVoteSide(uint256 tokenId, address lpAsset) external view returns (IVoter.MarketSide[] memory);
  function getVoteDetails(uint256 _tokenId, address _lpAsset) external view returns (IVoter.VoteDetails memory);
  function markets(uint256 index) external view returns (IVoter.Market memory);
  function weights(address market, IVoter.MarketSide marketSide, address lp) external view returns (uint256);
}

interface IBribeRewardsView {
  function rewards(uint256 index) external view returns (address);
  function rewardsListLength() external view returns (uint256);
  function earned(address token, uint256 tokenId) external view returns (uint256);
}

interface IMasterPriceOracle {
  function price(address underlying) external view returns (uint256);
}
