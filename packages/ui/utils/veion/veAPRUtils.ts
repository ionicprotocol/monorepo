// Function to calculate the veAPR (Bribe ROI as APY)
export const calculateVeAPR = (
  incentiveUsdValue: number, // Weekly incentive value in USD
  totalVotesValue: number, // Total value of veION votes for this market
  weeklyPeriod: boolean = true // Whether the incentive period is weekly (true) or not
): number => {
  if (totalVotesValue <= 0 || incentiveUsdValue <= 0) {
    return 0;
  }

  // Calculate weekly ROI
  const weeklyROI = incentiveUsdValue / totalVotesValue;

  // Annualize based on weekly compounding (52 weeks)
  // If the period is not weekly, adjust accordingly
  const periodsPerYear = weeklyPeriod ? 52 : 365; // Default to daily if not weekly

  // Calculate APY with compounding using the formula: (1 + r)^n - 1
  const annualizedAPR = Math.pow(1 + weeklyROI, periodsPerYear) - 1;

  // Convert to percentage and return
  return annualizedAPR * 100;
};

// Helper function to estimate total votes value in USD
export const estimateTotalVotesValueUSD = (
  totalVotes: { percentage: number; limit: number },
  veIonPrice: number // Price of veION in USD
): number => {
  return totalVotes.limit * veIonPrice;
};
