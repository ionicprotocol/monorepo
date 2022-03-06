pragma solidity >=0.8.0;

import "./CToken.sol";
import "./ExponentialNoError.sol";
import "./Comptroller.sol";
import "./RewardsDistributorStorage.sol";

interface ICErc20Plugin {
  function claim() external;
}

/**
 * @title PluginRewardsDistributorDelegate (Distribution logic based on rewards accrued to CErc20PluginDelegate)
 * @author Joey Santoro, inspired by RewardDistributorDelegate
 *
 * Instead of having a hardcoded compSpeed, the PluginRewardsDistributor incentivizes suppliers based on a plugin's rewards
 * It pulls the actual accrued amounts from the cToken based on the plugin distribution.
 */
contract PluginRewardsDistributorDelegate is RewardsDistributorDelegateStorageV1, ExponentialNoError {
  /// @dev Notice that this contract is a RewardsDistributor
  bool public constant isRewardsDistributor = true;

  /// @notice Emitted when COMP is distributed to a supplier
  event DistributedSupplierComp(
    CToken indexed cToken,
    address indexed supplier,
    uint256 compDelta,
    uint256 compSupplyIndex
  );

  /// @notice The initial COMP index for a market
  uint224 public constant compInitialIndex = 1e36;

  /// @dev Intitializer to set admin to caller and set reward token
  function initialize(address _rewardToken) external {
    require(msg.sender == admin, "Only admin can initialize.");
    require(rewardToken == address(0), "Already initialized.");
    require(_rewardToken != address(0), "Cannot initialize reward token to the zero address.");
    rewardToken = _rewardToken;
  }

  /*** Comp Distribution ***/

  /**
   * @notice Check the cToken before adding
   * @param cToken The market to add
   */
  function checkCToken(CToken cToken) internal view {
    // Make sure cToken is listed
    Comptroller comptroller = Comptroller(address(cToken.comptroller()));
    (bool isListed, ) = comptroller.markets(address(cToken));
    require(isListed == true, "comp market is not listed");

    // Make sure distributor is added
    bool distributorAdded = false;
    address[] memory distributors = comptroller.getRewardsDistributors();
    for (uint256 i = 0; i < distributors.length; i++) if (distributors[i] == address(this)) distributorAdded = true;
    require(distributorAdded == true, "distributor not added");
  }

  /**
   * @notice Accrue COMP to the market by updating the supply index
   * @param cToken The market whose supply index to update
   * @dev pulls COMP from CToken, requires ERC-20 approval within token
   */
  function updateCompSupplyIndex(address cToken) internal {
    ICErc20Plugin(cToken).claim();
    CompMarketState storage supplyState = compSupplyState[cToken];
    EIP20NonStandardInterface comp = EIP20NonStandardInterface(rewardToken);
    uint256 compAccrued_ = comp.balanceOf(cToken);
    if (compAccrued_ > 0) {
      comp.transferFrom(cToken, address(this), compAccrued_);
      uint256 supplyTokens = CToken(cToken).totalSupply();
      Double memory ratio = supplyTokens > 0 ? fraction(compAccrued_, supplyTokens) : Double({ mantissa: 0 });
      Double memory index = add_(Double({ mantissa: supplyState.index }), ratio);
      compSupplyState[cToken] = CompMarketState({
        index: safe224(index.mantissa, "new index exceeds 224 bits"),
        block: 0
      });
    }
  }

  /**
   * @notice Add market for initial rewards
   * @param cToken The market to add
   */
  function _addMarketForRewards(address cToken) public {
    require(msg.sender == admin, "only admin can set comp speed");
    compSupplyState[cToken] = CompMarketState({ index: compInitialIndex, block: 0 });

    // Add to allMarkets array
    allMarkets.push(CToken(cToken));
  }

  /**
   * @notice Calculate COMP accrued by a supplier and possibly transfer it to them
   * @param cToken The market in which the supplier is interacting
   * @param supplier The address of the supplier to distribute COMP to
   */
  function distributeSupplierComp(address cToken, address supplier) internal {
    CompMarketState storage supplyState = compSupplyState[cToken];
    Double memory supplyIndex = Double({ mantissa: supplyState.index });
    Double memory supplierIndex = Double({ mantissa: compSupplierIndex[cToken][supplier] });
    compSupplierIndex[cToken][supplier] = supplyIndex.mantissa;

    if (supplierIndex.mantissa == 0 && supplyIndex.mantissa > 0) {
      supplierIndex.mantissa = compInitialIndex;
    }

    Double memory deltaIndex = sub_(supplyIndex, supplierIndex);
    uint256 supplierTokens = CToken(cToken).balanceOf(supplier);
    uint256 supplierDelta = mul_(supplierTokens, deltaIndex);
    uint256 supplierAccrued = add_(compAccrued[supplier], supplierDelta);
    compAccrued[supplier] = supplierAccrued;
    emit DistributedSupplierComp(CToken(cToken), supplier, supplierDelta, supplyIndex.mantissa);
  }

  /**
   * @notice Keeps the flywheel moving pre-mint and pre-redeem
   * @dev Called by the Comptroller
   * @param cToken The relevant market
   * @param supplier The minter/redeemer
   */
  function flywheelPreSupplierAction(address cToken, address supplier) external {
    if (compSupplyState[cToken].index > 0) {
      updateCompSupplyIndex(cToken);
      distributeSupplierComp(cToken, supplier);
    }
  }

  /**
   * @notice Keeps the flywheel moving pre-borrow and pre-repay
   * @dev Called by the Comptroller
   * @param cToken The relevant market
   * @param borrower The borrower
   */
  function flywheelPreBorrowerAction(address cToken, address borrower) external {
    // no-op
  }

  /**
   * @notice Keeps the flywheel moving pre-transfer and pre-seize
   * @dev Called by the Comptroller
   * @param cToken The relevant market
   * @param src The account which sources the tokens
   * @param dst The account which receives the tokens
   */
  function flywheelPreTransferAction(
    address cToken,
    address src,
    address dst
  ) external {
    if (compSupplyState[cToken].index > 0) {
      updateCompSupplyIndex(cToken);
      distributeSupplierComp(cToken, src);
      distributeSupplierComp(cToken, dst);
    }
  }

  /**
   * @notice Claim all the comp accrued by holder in all markets
   * @param holder The address to claim COMP for
   */
  function claimRewards(address holder) public {
    return claimRewards(holder, allMarkets);
  }

  /**
   * @notice Claim all the comp accrued by holder in the specified markets
   * @param holder The address to claim COMP for
   * @param cTokens The list of markets to claim COMP in
   */
  function claimRewards(address holder, CToken[] memory cTokens) public {
    address[] memory holders = new address[](1);
    holders[0] = holder;
    claimRewards(holders, cTokens, true, true);
  }

  /**
   * @notice Claim all comp accrued by the holders
   * @param holders The addresses to claim COMP for
   * @param cTokens The list of markets to claim COMP in
   * @param borrowers Whether or not to claim COMP earned by borrowing
   * @param suppliers Whether or not to claim COMP earned by supplying
   */
  function claimRewards(
    address[] memory holders,
    CToken[] memory cTokens,
    bool borrowers,
    bool suppliers
  ) public {
    for (uint256 i = 0; i < cTokens.length; i++) {
      CToken cToken = cTokens[i];
      if (suppliers == true && compSupplyState[address(cToken)].index > 0) {
        updateCompSupplyIndex(address(cToken));
        for (uint256 j = 0; j < holders.length; j++) {
          distributeSupplierComp(address(cToken), holders[j]);
        }
      }
    }
    for (uint256 j = 0; j < holders.length; j++) {
      compAccrued[holders[j]] = grantCompInternal(holders[j], compAccrued[holders[j]]);
    }
  }

  /**
   * @notice Transfer COMP to the user
   * @dev Note: If there is not enough COMP, we do not perform the transfer all.
   * @param user The address of the user to transfer COMP to
   * @param amount The amount of COMP to (possibly) transfer
   * @return The amount of COMP which was NOT transferred to the user
   */
  function grantCompInternal(address user, uint256 amount) internal returns (uint256) {
    EIP20NonStandardInterface comp = EIP20NonStandardInterface(rewardToken);
    uint256 compRemaining = comp.balanceOf(address(this));
    if (amount > 0 && amount <= compRemaining) {
      comp.transfer(user, amount);
      return 0;
    }
    return amount;
  }

  /*** Comp Distribution Admin ***/

  /*** Helper Functions */
  /**
   * @notice Returns an array of all markets.
   */
  function getAllMarkets() external view returns (CToken[] memory) {
    return allMarkets;
  }
}
