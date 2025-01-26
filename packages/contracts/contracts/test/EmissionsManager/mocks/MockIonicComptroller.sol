// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ICErc20 } from "../../../compound/CTokenInterfaces.sol";
import { IonicFlywheelCore } from "../../../ionic/strategies/flywheel/IonicFlywheelCore.sol";

contract MockIonicComptroller {
    address public oracle;
    address public asset;
    address public flywheel;

    // Allows setting mock eth values for testing purposes
    function setOracle(address _oracle) external {
        oracle = _oracle;
    }

    function setAssetsIn(address _asset) external {
        asset = _asset;
    }

    function setFlywheel(address _flywheel) external {
        flywheel = _flywheel;
    }
    function getAssetsIn(address _user) public view returns (ICErc20[] memory)  {
        ICErc20[] memory assets = new ICErc20[](1);    
        assets[0] = ICErc20(asset); 
        return assets;
    }

    function getAllMarkets() public view returns (ICErc20[] memory)  {
        ICErc20[] memory assets = new ICErc20[](1);    
        assets[0] = ICErc20(asset); 
        return assets;
    }

    function getAccruingFlywheels() public view returns (IonicFlywheelCore[] memory)  {
        IonicFlywheelCore[] memory flywheels = new IonicFlywheelCore[](1);    
        flywheels[0] = IonicFlywheelCore(flywheel); 
        return flywheels;
    }
}