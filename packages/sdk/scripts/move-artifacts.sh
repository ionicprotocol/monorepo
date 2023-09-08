#!/usr/bin/env bash
rm -rf ./artifacts
mkdir ./artifacts


for file in $(find ./lib/contracts/out -name '*.json' | grep -iv test); do
    # exclude duplicates with incomplete interfaces
    if [[ $file == *"ReplacingFlywheelDynamicRewards"* ]]; then
        echo "Skipping $file"
    fi
    if [[ $file == *"FuseFlywheelDynamicRewardsPlugin"* ]]; then
        echo "Skipping $file"
    fi
    if [[ $file == *"IPlugin"* ]]; then
       echo "Skipping $file"
    fi
    cp $file ./artifacts;
done


cp ./lib/contracts/out/test.sol/*.json ./artifacts;
