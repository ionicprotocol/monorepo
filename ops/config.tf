
locals {
  secret_env_vars = [
    { name = "ETHEREUM_ADMIN_ACCOUNT", value = var.ethereum_admin_account },
    { name = "ETHEREUM_ADMIN_PRIVATE_KEY", value = var.ethereum_admin_private_key },
  ]
  twap_bot_env_vars = [
    { name = "DEFAULT_MIN_PERIOD", value = "1800" },
    { name = "DEFAULT_DEVIATION_THRESHOLD", value = "0.05" },
    { name = "TWAP_UPDATE_ATTEMPT_INTERVAL_SECONDS", value = "30" },
    { name = "SPEED_UP_TRANSACTION_AFTER_SECONDS", value = "120" },
    { name = "REDUNDANCY_DELAY_SECONDS", value = "0" },
  ]

  bsc_mainnet_rpc_0          = "https://speedy-nodes-nyc.moralis.io/${var.moralis_api_key}/bsc/mainnet"
  bsc_mainnet_rpc_1          = "https://bsc.getblock.io/mainnet/?api_key=${var.getblock_api_key}"
  bsc_mainnet_rpc_2          = "https://bsc-mainnet.gateway.pokt.network/v1/lb/${var.pokt_api_key}"
  bsc_mainnet_chain_id       = "56"
  bsc_mainnet_supported_pais = "0x84392649eb0bC1c1532F2180E58Bae4E1dAbd8D6|0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c"

  bsc_testnet_rpc            = "https://speedy-nodes-nyc.moralis.io/${var.moralis_api_key}/bsc/testnet/archive"
  bsc_testnet_chain_id       = "97"
  bsc_testnet_supported_pais = "0xAE4C99935B1AA0e76900e86cD155BFA63aB77A2a|0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd,0x3129B45b375a11Abf010D2D10DB1E3DcF474A13c|0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd,0x5126C1B8b4368c6F07292932451230Ba53a6eB7A|0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7"

  moonbeam_mainnet_rpc_0          = "https://moonbeam-mainnet.gateway.pokt.network/v1/lb/${var.pokt_api_key}"
  moonbeam_mainnet_rpc_1          = "https://moonbeam-mainnet.gateway.pokt.network/v1/lb/${var.pokt_api_key}"
  moonbeam_mainnet_chain_id       = "1284"
  moonbeam_mainnet_supported_pais = "0x99588867e817023162F4d4829995299054a5fC57|0xAcc15dC74880C9944775448304B263D191c6077F"

  evmos_testnet_rpc            = "https://eth.bd.evmos.dev:8545"
  evmos_testnet_chain_id       = "9000"
  evmos_testnet_supported_pais = "0x99588867e817023162F4d4829995299054a5fC57|0xAcc15dC74880C9944775448304B263D191c6077F"
}
