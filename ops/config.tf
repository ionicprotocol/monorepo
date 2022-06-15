
locals {
  secret_env_vars = [
    { name = "ETHEREUM_ADMIN_ACCOUNT", value = var.ethereum_admin_account },
    { name = "ETHEREUM_ADMIN_PRIVATE_KEY", value = var.ethereum_admin_private_key },
  ]
}
