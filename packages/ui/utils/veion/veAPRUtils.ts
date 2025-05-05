// Function to calculate the veAPR (Bribe ROI as APY)
export const calculateVeAPR = (
  incentiveUsdValue: number, // Weekly incentive value in USD
  totalVotesValue: number // Total value of veION votes for this market
): number => {
  if (totalVotesValue <= 0) {
    return incentiveUsdValue > 0 ? Infinity : 0;
  }

  if (incentiveUsdValue <= 0) {
    return 0;
  }

  // Calculate weekly ROI
  const weeklyROI = incentiveUsdValue / totalVotesValue;

  const periodsPerYear = 52;

  // Calculate APY with compounding using the formula: (1 + r)^n - 1
  const annualizedAPR = Math.pow(1 + weeklyROI, periodsPerYear) - 1;

  // Convert to percentage
  const result = annualizedAPR * 100;

  return result;
};
