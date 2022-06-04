#!/usr/bin/env bash
POOL_NAME="Test Pool 7"

# get these from the console
TOUCH=0xD54Ae101D6980dB5a8Aa60124b2e5D4B7f02f12C
TRIBE=0xeD4764ad14Bb60DC698372B92e51CEC62688DC52
MPO=0xb9e1c2B011f252B9931BBA7fcee418b95b6Bdc31
IRM=0x193E8ffD909c919E406776906F3De68CA202BE61
STRATEGY=0x0152B5D6531fb9D58274caA61C5a3070bE0DA12F


REWARD=$TOUCH


#STRATEGY=0xcfeD223fAb2A41b5a5a5F9AaAe2D1e882cb6Fe2D
FLYWHEEL=0xcB8A516b152a2c510d0860b551f157A9a3fc0f24

yarn workspace @midas-capital/sdk hardhat pool:create --name "$POOL_NAME" --creator deployer --price-oracle $MPO --close-factor 50 --liquidation-incentive 8 --enforce-whitelist false --network localhost
yarn workspace @midas-capital/sdk hardhat oracle:set-price --address $TOUCH --price "0.01" --network localhost
yarn workspace @midas-capital/sdk hardhat oracle:set-price --address $TRIBE --price "0.001" --network localhost

# dynamic rewards -> TRIBE underlying, TOUCH dynamic rewards 
yarn workspace @midas-capital/sdk hardhat market:create --pool-name "$POOL_NAME" \
    --creator deployer \
    --symbol TRIBE \
    --strategy-code "Mock_TRIBE" \
    --strategy-address "$STRATEGY" \
    --flywheels "$FLYWHEEL" \
    --reward-tokens "$REWARD" \
    --network localhost

# npx hardhat market:create --asset-config "$POOL_NAME,deployer,CErc20PluginRewardsDelegate,$TOUCH,$IRM,0.01,0.9,1,0,true,$STRATEGY,$FLYWHEEL,$REWARD" --network localhost

