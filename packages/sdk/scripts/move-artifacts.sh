#!/usr/bin/env bash
rm -rf ./artifacts
mkdir ./artifacts

# define the array of files ( should be excluded)
EXCLUDED_FILES=(
  "./lib/contracts/out/ICErc20.sol/ICErc20.json"
)

for file in $(find ./lib/contracts/out -name '*.json' | grep -iv "${EXCLUDED_FILES[@]}" | grep -iv test); do
    cp $file ./artifacts;
done


cp ./lib/contracts/out/test.sol/*.json ./artifacts;
