export type MidasApiTokenData = {
  symbol: string;
  name: string;
  decimals: number;
  color: string;
  overlayTextColor: string;
  address: string;
  logoURL: string;
};

export type TokensDataMap = { [address: string]: MidasApiTokenData };
