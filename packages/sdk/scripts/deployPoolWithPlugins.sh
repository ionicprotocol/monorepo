#!/bin/bash
# set -x

export POOL_NAME='Pool with Plugins'
export ZERO=0x0000000000000000000000000000000000000000

export NATIVE=$ZERO
export TOUCH=0x54572129Fd040C19F9ab57A1a152e95C1fEC0dF0
export TRIBE=0x5d7075e5A69A4d55BfA86F8d6ae49D7893D968f9

export MPO=0xC3ABf2cB82C65474CeF8F90f1a4DAe79929B1940
export IRM=0x70f3acf35940c8b3E427C1900C06ce7AB1067Ca9

export FLYWHEEL=""
export REWARD=$TRIBE

echo "Deploying Strategy ..."
# TODO what was "--other-params again?" Might be wrong here

npx hardhat strategy:create --strategy-name AlpacaERC4626 --underlying $TOUCH --name Plugin-Alpaca-Token --symbol pATOKEN --creator deployer --other-params "0xd7D069493685A581d27824Fc46EdA46B7EfC0063" --network localhost
echo "------------------------------------------------------"
# TODO get strategy from cli call
STRATEGY=0xdC206B5684A85ddEb4e2e1Ca48A1fCb5C3d31Ef3

echo "Deploying Pool: \"$POOL_NAME\" ... "
npx hardhat pool:create --name "\"$POOL_NAME\"" --creator deployer --price-oracle $MPO --close-factor 50 --liquidation-incentive 8 --enforce-whitelist false --network localhost
echo "------------------------------------------------------"
# # NATIVE vanilla CToken
# npx hardhat oracle:set-price --address 0x0000000000000000000000000000000000000000 --price "1" --network localhost
# npx hardhat market:create --asset-config Test,deployer,"CErc20Delegate",$NATIVE,0x060C1e69Ee7aC35bFfa0D938FA085071F40bE45E,0.01,0.9,1,0,true,"","","" --network localhost

# TRIBE with Plugin
echo "Deploying CErc20PluginDelegate ..."
npx hardhat oracle:set-price --address $TRIBE --price "0.001" --network localhost
npx hardhat market:create --asset-config "\"$POOL_NAME\"",deployer,"CErc20PluginDelegate",$TRIBE,$IRM,0.01,0.9,1,0,true,$STRATEGY,"","" --network localhost
echo "------------------------------------------------------"


# TOUCH with Plugin and Rewards
echo "Deploying CErc20PluginRewardsDelegate ... "
echo
export STRATEGY=0xdC206B5684A85ddEb4e2e1Ca48A1fCb5C3d31Ef3
export FLYWHEEL=0x681cEEE3d6781394b2ECD7a4b9d5214f537aFeEb
export REWARD=$TOUCH
npx hardhat oracle:set-price --address $TOUCH --price "0.01" --network localhost
npx hardhat market:create --asset-config "$POOL_NAME,deployer,CErc20PluginRewardsDelegate,$TOUCH,$IRM,0.01,0.9,1,0,true,$STRATEGY,$FLYWHEEL,$REWARD" --network localhost