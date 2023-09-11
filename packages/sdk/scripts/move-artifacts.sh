#!/usr/bin/env bash
rm -rf ./artifacts
mkdir ./artifacts

cp -R ./lib/contracts/out/. ./artifacts
rm -rf ./artifacts/*Test*.sol
rm -rf ./artifacts/*.t.sol

cp ./lib/contracts/out/test.sol/*.json ./artifacts;
