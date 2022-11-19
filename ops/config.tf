
locals {
  shared_secret_env_vars = [
    { name = "ETHEREUM_ADMIN_ACCOUNT", value = var.ethereum_admin_account },
    { name = "ETHEREUM_ADMIN_PRIVATE_KEY", value = var.ethereum_admin_private_key },
  ]

  shared_env_vars = [
    { name = "NODE_ENV", value = "production" },
    { name = "LOG_LEVEL", value = "info" },
  ]
  oracle_monitor_env_vars = [
    { name = "SUPABASE_URL", value = "https://xdjnvsfkwtkwfuayzmtm.supabase.co" },
    { name = "SUPABASE_KEY", value = var.supabase_key },
    { name = "CHECK_PRICE_INTERVAL", value = "21600" },
    { name = "MINIMAL_TWAP_DEPTH", value = "1000000" }
  ]

  liquidation_secrets = [
    { name = "DISCORD_WEBHOOK_URL", value = var.liquidation_discord_webhook_url },
  ]

  oracle_monitor_secrets = [
    { name = "DISCORD_WEBHOOK_URL", value = var.oracles_discord_webhook_url },
  ]

  bsc_mainnet_rpc_0    = var.chainstack_bsc_rpc_url
  bsc_mainnet_rpc_1    = "https://bsc-dataseed.binance.org"
  bsc_mainnet_chain_id = "56"

  moonbeam_mainnet_rpc_0    = "https://moonbeam.public.blastapi.io"
  moonbeam_mainnet_rpc_1    = "https://rpc.ankr.com/moonbeam"
  moonbeam_mainnet_chain_id = "1284"

  evmos_testnet_rpc      = "https://eth.bd.evmos.dev:8545"
  evmos_testnet_chain_id = "9000"

  polygon_mainnet_rpc_0    = var.chainstack_polygon_rpc_url
  polygon_mainnet_rpc_1    = "https://rpc.ankr.com/polygon"
  polygon_mainnet_chain_id = "137"

}


locals {
  shared_variables = concat(
    local.shared_env_vars,
    local.shared_secret_env_vars,
  )

  oracles_variables = concat(
    local.shared_variables,
    local.oracle_monitor_env_vars,
    local.oracle_monitor_secrets,
  )

  liquidation_variables = concat(
    local.shared_variables,
    local.liquidation_secrets,
  )
}
