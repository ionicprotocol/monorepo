#!/usr/bin/env bash
POOL_NAME="Test Pool 7"

# get these from the console
TOUCH=0xD54Ae101D6980dB5a8Aa60124b2e5D4B7f02f12C
TRIBE=0xeD4764ad14Bb60DC698372B92e51CEC62688DC52

MPO=0xCcB44fb557ac32220136fF752C3e5cf5c6729aFF

IRM=0x63d500493B787CAbC8E7f6D29896022f4aB9c33B
STRATEGY=0x0152B5D6531fb9D58274caA61C5a3070bE0DA12F


REWARD=$TOUCH


#STRATEGY=0xcfeD223fAb2A41b5a5a5F9AaAe2D1e882cb6Fe2D
FLYWHEEL=0xcB8A516b152a2c510d0860b551f157A9a3fc0f24

yarn workspace @midas-capital/sdk hardhat pool:create --name "$POOL_NAME" --creator deployer --price-oracle $MPO --close-factor 50 --liquidation-incentive 8 --enforce-whitelist false --network localhost
# yarn workspace @midas-capital/sdk hardhat oracle:set-price --address $TOUCH --price "0.01" --network localhost
# yarn workspace @midas-capital/sdk hardhat oracle:set-price --address $TRIBE --price "0.001" --network localhost

# dynamic rewards -> TRIBE underlying, TOUCH dynamic rewards 
# yarn workspace @midas-capital/sdk hardhat market:create --pool-name "$POOL_NAME" \
#     --creator deployer \
#     --symbol TRIBE \
#     --strategy-code "Mock_TRIBE" \
#     --strategy-address "$STRATEGY" \
#     --flywheels "$FLYWHEEL" \
#     --reward-tokens "$REWARD" \
#     --network localhost

yarn workspace @midas-capital/sdk hardhat market:create --pool-name "$POOL_NAME" \
    --creator deployer \
    --symbol WBNB \
    --network localhost

yarn workspace @midas-capital/sdk hardhat market:create --pool-name "$POOL_NAME" \
    --creator deployer \
    --symbol BTCB \
    --network localhost

yarn workspace @midas-capital/sdk hardhat market:create --pool-name "$POOL_NAME" \
    --creator deployer \
    --symbol BUSD \
    --network localhost


# npx hardhat market:create --asset-config "$POOL_NAME,deployer,CErc20PluginRewardsDelegate,$TOUCH,$IRM,0.01,0.9,1,0,true,$STRATEGY,$FLYWHEEL,$REWARD" --network localhost

