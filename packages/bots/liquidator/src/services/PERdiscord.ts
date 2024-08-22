import axios from "axios";
import { OpportunityParams } from "@pythnetwork/express-relay-evm-js";
import { IonicSdk } from "@ionicprotocol/sdk";
import { chainIdtoChain, chainIdToConfig } from "@ionicprotocol/chains";
import { Chain, createPublicClient, erc20Abi, formatEther, http } from "viem";
import { SupportedChains } from "@ionicprotocol/types";

import config from "../config";
const webhookUrl = config.PER_discordWebhookUrl;
const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=";
const DEFI_LLAMA_API = "https://coins.llama.fi/prices/current/";
async function getUSDPrice(chainId: SupportedChains): Promise<number> {
  const config = chainIdToConfig[chainId];
  const cgId = config?.specificParams?.cgId;
  let price = 0;
  if (!cgId) {
    console.error(`No Coingecko ID found for chainId ${chainId}`);
    return price;
  }
  try {
    const { data } = await axios.get(`${COINGECKO_API}${cgId}`);
    console.log("Coingecko response:", data);
    if (data[cgId] && data[cgId].usd) {
      price = Number(data[cgId].usd);
    } else {
      throw new Error(`Coingecko did not return price for ${cgId}`);
    }
  } catch (e) {
    console.log("Coingecko fetch failed, trying DeFi Llama...");
    try {
      const { data } = await axios.get(`${DEFI_LLAMA_API}coingecko:${cgId}`);
      console.log("DeFi Llama response:", data);
      if (data.coins[`coingecko:${cgId}`] && data.coins[`coingecko:${cgId}`].price) {
        price = Number(data.coins[`coingecko:${cgId}`].price);
      } else {
        throw new Error(`DeFi Llama did not return price for ${cgId}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Failed to fetch USD price:`, error.response?.data || error.message);
      } else {
        console.error(`Failed to fetch USD price:`, error);
      }
    }
  }
  console.log(`USD price for ${cgId}: ${price}`);
  return price;
}
async function getTokenUSDValue(chainId: SupportedChains, tokenAddress: string, amount: bigint): Promise<string> {
  const config = chainIdToConfig[chainId];
  const chain = chainIdtoChain[chainId] as Chain;
  if (!config || !chain) {
    console.error(`No configuration found for chainId ${chainId}`);
    return "N/A";
  }
  const publicClient = createPublicClient({
    chain: chain,
    transport: http(config.specificParams.metadata.rpcUrls.default.http[0]),
  });
  const sdk = new IonicSdk(publicClient as any, undefined, config);
  const mpo = sdk.createMasterPriceOracle();
  try {
    const formattedTokenAddress = `0x${tokenAddress.replace(/^0x/, "")}` as `0x${string}`;
    console.log("Token address:", tokenAddress);
    // Get the token's price in ETH
    const priceInETH = await mpo.read.price([formattedTokenAddress as `0x${string}`]);
    const priceInETHNum = Number(formatEther(priceInETH));
    
    // Get the token's decimals
    const tokenDecimals = await publicClient.readContract({
      address: formattedTokenAddress,
      abi: erc20Abi,
      functionName: "decimals",
    });
    
    // Adjust the amount to 18 decimals
    const scaleFactor = BigInt(10 ** (18 - tokenDecimals));
    const scaledAmount = amount * scaleFactor;
    // Get the USD price of ETH
    const usdPrice = await getUSDPrice(chainId);
    const amountNum = Number(formatEther(scaledAmount));
    // Debugging logs
    console.log("Price in ETH:", priceInETHNum);
    console.log("USD Price:", usdPrice);
    console.log("Token Amount:", amountNum);
    const usdValue = priceInETHNum * usdPrice * amountNum;
    return usdValue.toFixed(10);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Failed to get USD value for token ${tokenAddress}:`, error.response?.data || error.message);
    } else {
      console.error(`Failed to get USD value for token ${tokenAddress}:`, error);
    }
    return "N/A";
  }
}
export async function sendDiscordNotification(opportunity: OpportunityParams) {
  const { chainId, targetContract, targetCalldata, permissionKey, targetCallValue, buyTokens, sellTokens } =
    opportunity;
  console.log("Opportunity data:", opportunity);
  // Convert chainId to SupportedChains type
  const chainIdConverted = 34443;
  if (!chainIdConverted) {
    console.error(`Invalid chainId: ${chainId}`);
    return;
  }
  // Prepare buy token messages with USD values
  const buyTokenMessages = await Promise.all(
    buyTokens.map(async (token) => {
      const usdValue = await getTokenUSDValue(chainIdConverted, token.token, token.amount);
      return `- **Token**: ${token.token}, **Amount**: ${token.amount}, **USD Value**: ${usdValue}`;
    })
  );
  // Prepare sell token messages with USD values
  const sellTokenMessages = await Promise.all(
    sellTokens.map(async (token) => {
      const usdValue = await getTokenUSDValue(chainIdConverted, token.token, token.amount);
      return `- **Token**: ${token.token}, **Amount**: ${token.amount}, **USD Value**: ${usdValue}`;
    })
  );
  const message = `
**Opportunity Submitted Successfully**
- **Chain ID**: ${chainId}
- **Target Contract**: ${targetContract}
- **Target Calldata**: ${targetCalldata}
- **Permission Key**: ${permissionKey}
- **Target Call Value**: ${targetCallValue}
**Buy Tokens:**
${buyTokenMessages.join("\n")}
**Sell Tokens:**
${sellTokenMessages.join("\n")}
**----------------------------------------------------------------------------------------**
`;
  try {
    await axios.post(webhookUrl, { content: message });
    console.log("Notification sent successfully.");
  } catch (error) {
    console.error("Failed to send Discord notification:", error);
  }
}
