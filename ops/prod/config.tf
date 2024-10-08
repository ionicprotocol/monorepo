locals {
  liquidator_ecr_repository_name      = "ionic-liquidator"
  oracles_monitor_ecr_repository_name = "ionic-oracles-monitor"
  pyth_updater_ecr_repository_name    = "ionic-pyth-updater"
  shared_env_vars_lambda = {
    ETHEREUM_ADMIN_ACCOUNT     = var.ethereum_admin_account,
    ETHEREUM_ADMIN_PRIVATE_KEY = var.ethereum_admin_private_key,
    SUPABASE_URL               = "https://uoagtjstsdrjypxlkuzr.supabase.co",
    SUPABASE_KEY               = var.supabase_key,
    NODE_ENV                   = "production",
    UPTIME_LIQUIDATOR_API      = var.uptime_liquidator_api,
    UPTIME_PYTH_UPDATER_API    = var.uptime_pyth_updater_api,
    DISCORD_SUCCESS_WEBHOOK_URL = var.discord_success_webhook_url,
    DISCORD_FAILURE_WEBHOOK_URL = var.discord_failure_webhook_url,
  }
}

locals {
  liquidation_variables = merge(
    local.shared_env_vars_lambda,
    {
      DISCORD_WEBHOOK_URL = var.liquidation_discord_webhook_url,
      SENDGRID_API_KEY    = var.liquidation_sendgrid_api_key,
      SENDGRID_EMAIL_TO   = var.liquidation_sendgrid_email_to,
      UPTIME_LIQUIDATOR_API = var.uptime_liquidator_api,
      DISCORD_SUCCESS_WEBHOOK_URL = var.discord_success_webhook_url,
      DISCORD_FAILURE_WEBHOOK_URL = var.discord_failure_webhook_url,
      
    }
  )
  liquidation_base_variables = merge(
    local.shared_env_vars_lambda,
    {
      DISCORD_WEBHOOK_URL = var.liquidation_discord_webhook_url,
      SENDGRID_API_KEY    = var.liquidation_sendgrid_api_key,
      SENDGRID_EMAIL_TO   = var.liquidation_sendgrid_email_to,
      UPTIME_LIQUIDATOR_API = var.uptime_liquidator_api,
      DISCORD_SUCCESS_WEBHOOK_URL = var.discord_success_webhook_url,
      DISCORD_FAILURE_WEBHOOK_URL = var.discord_failure_webhook_url,
    }
  )
  liquidation_optimism_variables = merge(
    local.shared_env_vars_lambda,
    {
      DISCORD_WEBHOOK_URL = var.liquidation_discord_webhook_url,
      SENDGRID_API_KEY    = var.liquidation_sendgrid_api_key,
      SENDGRID_EMAIL_TO   = var.liquidation_sendgrid_email_to,
      UPTIME_LIQUIDATOR_API = var.uptime_liquidator_api,
      DISCORD_SUCCESS_WEBHOOK_URL = var.discord_success_webhook_url,
      DISCORD_FAILURE_WEBHOOK_URL = var.discord_failure_webhook_url,
    }
  )
  oracle_price_change_verifier_lambda_variables = merge(
    local.shared_env_vars_lambda,
    { SERVICE = "price-change-verifier" },
    { DISCORD_WEBHOOK_URL = var.oracles_discord_webhook_url }
  )
  oracle_price_verifier_lambda_variables = merge(
    local.shared_env_vars_lambda,
    { SERVICE = "price-verifier" },
    { DISCORD_WEBHOOK_URL = var.oracles_discord_webhook_url }
  )
  oracle_feed_verifier_lambda_variables = merge(
    local.shared_env_vars_lambda,
    { SERVICE = "feed-verifier" },
    { DISCORD_WEBHOOK_URL = var.oracles_discord_webhook_url }
  )
  pyth_updater_lambda_variables = merge(
  local.shared_env_vars_lambda,
  {
    DISCORD_WEBHOOK_URL                           = var.pyth_updater_discord_webhook_url,
    UPTIME_PYTH_UPDATER_API                       = var.uptime_pyth_updater_api,
    PYTH_UPDATER_ETHEREUM_ADMIN_ACCOUNT           = var.pyth_updater_ethereum_admin_account, # Use PYTH_UPDATER specific variable
    PYTH_UPDATER_ETHEREUM_ADMIN_PRIVATE_KEY       = var.pyth_updater_ethereum_admin_private_key, # Use PYTH_UPDATER specific variable
  }
  )
}
