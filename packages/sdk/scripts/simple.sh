POOL_NAME="Test Pool"

# get these from the console
TOUCH=XXXX
TRIBE=XXXX
MPO=0xC3ABf2cB82C65474CeF8F90f1a4DAe79929B1940
IRM=0x70f3acf35940c8b3E427C1900C06ce7AB1067Ca9
STRATEGY=0xdC206B5684A85ddEb4e2e1Ca48A1fCb5C3d31Ef3
FLYWHEEL=0x681cEEE3d6781394b2ECD7a4b9d5214f537aFeEb

npx hardhat pool:create --name "$POOL_NAME" --creator deployer --price-oracle $MPO --close-factor 50 --liquidation-incentive 8 --enforce-whitelist false --network localhost
npx hardhat oracle:set-price --address $TOUCH --price "0.01" --network localhost
npx hardhat oracle:set-price --address $TRIBE --price "0.001" --network localhost

# no dynamic rewards
npx hardhat market:create --asset-config "$POOL_NAME,deployer,CErc20PluginDelegate,$TRIBE,$IRM,0.01,0.9,1,0,true,$STRATEGY,'',''" --network localhost

# dynamic rewards
npx hardhat market:create --asset-config "$POOL_NAME,deployer,CErc20PluginRewardsDelegate,$TOUCH,$IRM,0.01,0.9,1,0,true,$STRATEGY,$FLYWHEEL,$REWARD" --network localhost

