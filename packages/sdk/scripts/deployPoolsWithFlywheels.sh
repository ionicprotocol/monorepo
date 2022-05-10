#!/bin/bash
npx hardhat pools:create --name "Pool with TOUCH Flywheel" --flywheel-token "0xa4498F7dBaBCF4248b0E9B8667aCb560252a8907" --flywheel-market TOUCH --network localhost
npx hardhat pools:create --name "Pool with TRIBE Flywheel" --flywheel-token "0x4557f20084DE100F2FCDC6f596e78BCAb6893562" --flywheel-market TRIBE --network localhost
npx hardhat pools:create --name "Pool without Rewards" --network localhost