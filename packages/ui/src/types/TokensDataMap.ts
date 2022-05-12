// From Rari API `tokenData` route
export type RariApiTokenData = {
  symbol: string;
  name: string;
  decimals: number;
  color: string;
  overlayTextColor: string;
  address: string;
  logoURL: string;
};

export type TokensDataMap = { [address: string]: RariApiTokenData };
