
locals {
  shared_secret_env_vars = [
    { name = "ETHEREUM_ADMIN_ACCOUNT", value = var.ethereum_admin_account },
    { name = "ETHEREUM_ADMIN_PRIVATE_KEY", value = var.ethereum_admin_private_key },
  ]

  shared_env_vars_lambda = {
    ETHEREUM_ADMIN_ACCOUNT     = var.ethereum_admin_account,
    ETHEREUM_ADMIN_PRIVATE_KEY = var.ethereum_admin_private_key,
    SUPABASE_URL               = "https://xdjnvsfkwtkwfuayzmtm.supabase.co",
    SUPABASE_KEY               = var.supabase_key,
    DISCORD_WEBHOOK_URL        = var.oracles_discord_webhook_url,
    NODE_ENV                   = "production",
  }

  shared_env_vars = [
    { name = "NODE_ENV", value = "production" },
    { name = "LOG_LEVEL", value = "info" },
  ]
  oracle_monitor_env_vars = [
    { name = "SUPABASE_URL", value = "https://xdjnvsfkwtkwfuayzmtm.supabase.co" },
    { name = "SUPABASE_KEY", value = var.supabase_key },
  ]

  liquidation_secrets = [
    { name = "DISCORD_WEBHOOK_URL", value = var.liquidation_discord_webhook_url },
  ]

  oracle_monitor_secrets = [
    { name = "DISCORD_WEBHOOK_URL", value = var.oracles_discord_webhook_url },
  ]

  evmos_testnet_rpc      = "https://eth.bd.evmos.dev:8545"
  evmos_testnet_chain_id = "9000"

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
  oracle_price_change_verifier_lambda_variables = merge(
    local.shared_env_vars_lambda,
    { ORACLE_MONITOR_SERVICE = "price-change-verifier" },
  )
}
