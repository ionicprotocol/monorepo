#!/usr/bin/env bash

set -e

./wait-for-hh.sh

npx hardhat pools:create-unhealthy-eth-borrow-token-collateral --network localhost
npx hardhat pools:create-unhealthy-token-borrow-token-collateral --network localhost
npx hardhat pools:create-unhealthy-token-borrow-eth-collateral --network localhost

npx hardhat e2e:unhealthy-pools-exist --network localhost

