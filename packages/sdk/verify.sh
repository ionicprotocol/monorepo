#!/bin/zsh

CONTRACTS_AND_ADDRESSES=$(cat ../chains/deployments/mode.json | jq '.contracts | to_entries')
LENGTH=$(echo $CONTRACTS_AND_ADDRESSES | jq 'length')

for i in {1..$LENGTH}
do
  ADDRESS=$(echo $CONTRACTS_AND_ADDRESSES | jq -r '.['$(($i-1))'].value.address')
  CONTRACT=$(echo $CONTRACTS_AND_ADDRESSES | jq -r '.['$(($i-1))'].key')
  #echo Verifying $CONTRACT at $ADDRESS ...
  echo ''
  echo "forge verify-contract --verifier blockscout --verifier-url 'https://explorer.mode.network/api?' --watch $ADDRESS $CONTRACT"
done
