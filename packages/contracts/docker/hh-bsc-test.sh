#!/usr/bin/env sh

set -e

sleep 15
FORK_URL=${FORK_URL_BSC} FORK_BLOCK_NUMBER=${FORK_BLOCK_NUMBER} FORK_CHAIN_ID=56 npx hardhat test --network localhost