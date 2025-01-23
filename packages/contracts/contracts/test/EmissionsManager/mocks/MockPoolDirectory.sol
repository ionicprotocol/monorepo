// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

struct Pool {
    string name;
    address creator;
    address comptroller;
    uint256 blockPosted;
    uint256 timestampPosted;
}

contract MockPoolDirectory {

    Pool[] public pools;

    // Allows setting mock eth values for testing purposes
    function setActivePools(address comptroller) external {
        Pool memory pool = Pool("Test Pool", msg.sender, comptroller, block.number, block.timestamp);
        pools.push(pool);
    }

    function getActivePools() public view returns (uint256[] memory, Pool[] memory)  {
        uint256[] memory activeIds = new uint256[](1);
        Pool[] memory activePools = new Pool[](1);
        activePools[0] = pools[0];
        return (activeIds, activePools);
    }
}