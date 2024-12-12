pragma solidity ^0.8.0;

interface FusePoolDirectory {
    struct FusePool {
        string name;
        address creator;
        address comptroller;
        uint256 blockPosted;
        uint256 timestampPosted;
    }
}
