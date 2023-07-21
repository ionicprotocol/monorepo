export type InterestRatesType = {
  borrowing: number;
  lending: number;
};

export type MarketInfo = {
  rates: InterestRatesType;
  tokenAddress: string;
};
