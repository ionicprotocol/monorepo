import { useMarketIncentives } from '@ui/hooks/veion/useMarketIncentives';

export const useBribeData = ({ chain }: { chain: number }) => {
  // Get all market addresses (this will be populated by useMarketRows)
  const marketAddresses: string[] = [];

  // Use the new market incentives hook
  const { rewardTokensInfo, getMarketIncentives, isLoading, error } =
    useMarketIncentives(chain, marketAddresses, '', undefined);

  const getRewardDetails = (
    marketAddress: string,
    side: 'borrow' | 'supply'
  ) => {
    // Get incentive amount for this market/side
    const incentiveAmount = getMarketIncentives(marketAddress, side);

    // If there's no incentive amount, return null
    if (!incentiveAmount || incentiveAmount === 0) {
      return null;
    }

    // Find token prices to calculate USD values
    const tokenPrices = rewardTokensInfo.reduce(
      (acc, token) => {
        acc[token.address.toLowerCase()] = token.price || 0;
        return acc;
      },
      {} as Record<string, number>
    );

    // Return the reward details in the expected format
    return {
      rewards: rewardTokensInfo.map((token) => ({
        symbol: token.symbol,
        weeklyAmount: String(incentiveAmount / rewardTokensInfo.length), // Distributing amount evenly among tokens as a fallback
        formattedWeeklyAmount: `${(incentiveAmount / rewardTokensInfo.length).toFixed(2)}`,
        priceUSD: token.price || 0
      })),
      incentiveAmount,
      marketAddress,
      side
    };
  };

  return {
    getRewardDetails,
    isLoading,
    error
  };
};
