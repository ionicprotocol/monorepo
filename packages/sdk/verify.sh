#!/bin/zsh

# Ensure the JSON file exists
json_file="../../../chains/deployments/base.json"
if [[ ! -f "$json_file" ]]; then
  echo "Error: JSON file does not exist at path $json_file"
  exit 1
fi

# Parse JSON and store it in a variable
contracts_and_addresses=$(jq '.contracts | to_entries' "$json_file")

# Calculate the length of the entries array
length=$(echo "$contracts_and_addresses" | jq 'length')

# Loop over the number of entries
for i in $(seq 1 $length); do
  index=$(($i - 1)) # Adjust index for 0-based array access

  # Extract the address and contract name using jq directly
  address=$(echo "$contracts_and_addresses" | jq -r ".[$index].value.address")
  contract=$(echo "$contracts_and_addresses" | jq -r ".[$index].key")
  contract=${contract//_Implementation/}
  contract=${DefaultProxyAdmin//ProxyAdmin/}
  if [[ "$contract" == *"_Proxy"* ]]; then
    contract="TransparentUpgradeableProxy"
  fi

  # Command output for verification
  forge verify-contract --watch --chain base $address $contract
done
