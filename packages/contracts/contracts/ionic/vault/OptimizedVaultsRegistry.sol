pragma solidity ^0.8.0;

import "../SafeOwnableUpgradeable.sol";
import "./OptimizedAPRVaultBase.sol";
import "./OptimizedAPRVaultExtension.sol";
import "../strategies/CompoundMarketERC4626.sol";
import "../strategies/flywheel/MidasFlywheel.sol";
import { ICErc20 } from "../../compound/CTokenInterfaces.sol";

import { IERC20MetadataUpgradeable as IERC20Metadata } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/extensions/ERC4626Upgradeable.sol";

contract OptimizedVaultsRegistry is SafeOwnableUpgradeable {
  OptimizedAPRVaultBase[] public vaults;

  mapping(address => OptimizedAPRVaultExtension[]) latestVaultExtensions;

  function initialize() public initializer {
    __SafeOwnable_init(msg.sender);
  }

  function getLatestVaultExtensions(address vault) public view returns (OptimizedAPRVaultExtension[] memory) {
    return latestVaultExtensions[vault];
  }

  function setLatestVaultExtensions(address vault, OptimizedAPRVaultExtension[] calldata extensions) public onlyOwner {
    latestVaultExtensions[vault] = extensions;
  }

  function getAllVaults() public view returns (OptimizedAPRVaultBase[] memory) {
    return vaults;
  }

  function addVault(address vault) public onlyOwner returns (bool) {
    for (uint256 i; i < vaults.length; i++) {
      if (address(vaults[i]) == vault) {
        return false;
      }
    }
    vaults.push(OptimizedAPRVaultBase(vault));
    return true;
  }

  function removeVault(address vault) public onlyOwner returns (bool) {
    for (uint256 i; i < vaults.length; i++) {
      if (address(vaults[i]) == vault) {
        vaults[i] = vaults[vaults.length - 1];
        delete vaults[vaults.length - 1];
        return true;
      }
    }
    return false;
  }

  function setEmergencyExit() external onlyOwner {
    for (uint256 i; i < vaults.length; ++i) {
      uint8 adaptersCount = vaults[i].adaptersCount();
      for (uint256 j; j < adaptersCount; ++j) {
        (CompoundMarketERC4626 adapter, ) = vaults[i].adapters(j);
        try adapter.emergencyWithdrawAndPause() {} catch {}
      }
      vaults[i].asSecondExtension().setEmergencyExit();
    }
  }

  struct ClaimableRewardsInfo {
    address flywheel;
    address vault;
    address rewardToken;
    string rewardTokenName;
    string rewardTokenSymbol;
    uint8 rewardTokenDecimals;
    uint256 rewards;
  }

  // @notice lens function to list all flywheels for which the account can claim rewards
  function getClaimableRewards(address account) external returns (ClaimableRewardsInfo[] memory rewardsData) {
    {
      uint256 totalFlywheels = 0;
      for (uint256 i = 0; i < vaults.length; i++) {
        MidasFlywheel[] memory flywheels = vaults[i].asFirstExtension().getAllFlywheels();
        totalFlywheels += flywheels.length;
      }

      rewardsData = new ClaimableRewardsInfo[](totalFlywheels);
    }

    {
      uint256 flywheelsCounter = 0;
      for (uint256 i = 0; i < vaults.length; i++) {
        OptimizedAPRVaultBase vault = vaults[i];
        MidasFlywheel[] memory flywheels = vault.asFirstExtension().getAllFlywheels();
        uint256 flywheelsLen = flywheels.length;

        for (uint256 j = 0; j < flywheelsLen; j++) {
          MidasFlywheel flywheel = flywheels[j];
          rewardsData[flywheelsCounter + j].vault = address(vault);
          rewardsData[flywheelsCounter + j].flywheel = address(flywheel);
          rewardsData[flywheelsCounter + j].rewards = flywheel.accrue(ERC20(address(vault)), account);
          ERC20 rewardToken = flywheel.rewardToken();
          rewardsData[flywheelsCounter + j].rewardToken = address(rewardToken);
          rewardsData[flywheelsCounter + j].rewardTokenName = rewardToken.name();
          rewardsData[flywheelsCounter + j].rewardTokenSymbol = rewardToken.symbol();
          rewardsData[flywheelsCounter + j].rewardTokenDecimals = rewardToken.decimals();
        }
        flywheelsCounter += flywheelsLen;
      }
    }
  }

  struct AdapterInfo {
    address adapter;
    uint64 allocation;
    address market;
    address pool;
  }

  struct VaultInfo {
    address vault;
    address asset;
    string assetSymbol;
    uint8 assetDecimals;
    uint256 estimatedTotalAssets;
    uint256 apr;
    uint256 adaptersCount;
    bool isEmergencyStopped;
    uint64 performanceFee;
    uint64 depositFee;
    uint64 withdrawalFee;
    uint64 managementFee;
    AdapterInfo[] adaptersData;
  }

  function getVaultsData() public view returns (VaultInfo[] memory vaultsData) {
    vaultsData = new VaultInfo[](vaults.length);
    for (uint256 i; i < vaults.length; ++i) {
      OptimizedAPRVaultSecondExtension vault = vaults[i].asSecondExtension();
      uint8 adaptersCount = vaults[i].adaptersCount();
      AdapterInfo[] memory adaptersData = new AdapterInfo[](adaptersCount);

      for (uint256 j; j < adaptersCount; ++j) {
        (CompoundMarketERC4626 adapter, uint64 allocation) = vaults[i].adapters(j);
        ICErc20 market = adapter.market();
        adaptersData[j].adapter = address(adapter);
        adaptersData[j].allocation = allocation;
        adaptersData[j].market = address(market);
        adaptersData[j].pool = address(market.comptroller());
      }

      (uint64 performanceFee, uint64 depositFee, uint64 withdrawalFee, uint64 managementFee) = vault.fees();

      vaultsData[i] = VaultInfo({
        vault: address(vault),
        asset: vault.asset(),
        assetSymbol: IERC20Metadata(vault.asset()).symbol(),
        assetDecimals: IERC20Metadata(vault.asset()).decimals(),
        estimatedTotalAssets: vault.estimatedTotalAssets(),
        apr: vault.estimatedAPR(),
        adaptersCount: adaptersCount,
        isEmergencyStopped: vault.emergencyExit(),
        performanceFee: performanceFee,
        depositFee: depositFee,
        withdrawalFee: withdrawalFee,
        managementFee: managementFee,
        adaptersData: adaptersData
      });
    }
  }
}
