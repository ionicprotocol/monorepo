
locals {
  secret_env_vars = [
    { name = "ETHEREUM_ADMIN_ACCOUNT", value = var.ethereum_admin_account },
    { name = "ETHEREUM_ADMIN_PRIVATE_KEY", value = var.ethereum_admin_private_key },
  ]
  twap_bot_env_vars = [
    { name = "DEFAULT_MIN_PERIOD", value = "1800" },
    { name = "DEFAULT_DEVIATION_THRESHOLD", value = "0.05" },
    { name = "TWAP_UPDATE_ATTEMPT_INTERVAL_SECONDS", value = "45" },
    { name = "SPEED_UP_TRANSACTION_AFTER_SECONDS", value = "120" },
    { name = "REDUNDANCY_DELAY_SECONDS", value = "0" },
  ]
  oracle_monitor_env_vars = [
    { name = "SUPABASE_URL", value = "https://xdjnvsfkwtkwfuayzmtm.supabase.co" },
    { name = "SUPABASE_KEY", value = var.supabase_key },
    { name = "CHECK_PRICE_INTERVAL", value = "21600" },
    { name = "MINIMAL_TWAP_DEPTH", value = "1000000" },
  ]

  bsc_mainnet_rpc_0          = "https://speedy-nodes-nyc.moralis.io/${var.moralis_api_key}/bsc/mainnet"
  bsc_mainnet_rpc_1          = "https://bsc.getblock.io/mainnet/?api_key=${var.getblock_api_key}"
  bsc_mainnet_rpc_2          = "https://bsc-mainnet.nodereal.io/v1/${var.nodereal_bsc_api_key}"
  bsc_mainnet_rpc_3          = "https://rpc.ankr.com/bsc"
  bsc_mainnet_chain_id       = "56"
  bsc_mainnet_supported_pais = "0x84392649eb0bC1c1532F2180E58Bae4E1dAbd8D6|0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c"
  
  moonbeam_mainnet_rpc_0          = "https://moonbeam-mainnet.gateway.pokt.network/v1/lb/${var.pokt_api_key}"
  moonbeam_mainnet_rpc_1          = "https://moonbeam-mainnet.gateway.pokt.network/v1/lb/${var.pokt_api_key}"
  moonbeam_mainnet_chain_id       = "1284"
  moonbeam_mainnet_supported_pais = "0x99588867e817023162F4d4829995299054a5fC57|0xAcc15dC74880C9944775448304B263D191c6077F"

  evmos_testnet_rpc            = "https://eth.bd.evmos.dev:8545"
  evmos_testnet_chain_id       = "9000"
  evmos_testnet_supported_pais = "0x99588867e817023162F4d4829995299054a5fC57|0xAcc15dC74880C9944775448304B263D191c6077F"

  polygon_mainnet_rpc_0          = "https://polygon-mainnet.nodereal.io/v1/${var.nodereal_matic_api_key}"
  polygon_mainnet_rpc_1          = "https://matic.getblock.io/mainnet/?api_key=${var.getblock_api_key}"
  polygon_mainnet_chain_id       = "137"
  polygon_mainnet_supported_pais = ""

}
