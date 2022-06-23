type CONFIG = {
  isRssScoreEnabled: boolean;
  iconServerURL: string | undefined;
  isDevelopment: boolean;
  isBscEnabled: boolean;
  isEvmosEnabled: boolean;
  isMoonbeamEnabled: boolean;
  isTestnetEnabled: boolean;
  allowedAddresses: string[];
};

const config: CONFIG = {
  isRssScoreEnabled: process.env.FEATURE_RSS === 'true',
  iconServerURL: process.env.ICON_SERVER,
  isDevelopment: process.env.NODE_ENV === 'development',
  isBscEnabled: process.env.BSC === 'true',
  isEvmosEnabled: process.env.EVMOS === 'ture',
  isMoonbeamEnabled: process.env.MOONBEAM === 'true',
  isTestnetEnabled: process.env.NEXT_PUBLIC_SHOW_TESTNETS === 'true',
  allowedAddresses: process.env.FEATURE_CREATE_POOL ? process.env.FEATURE_CREATE_POOL.toLowerCase().split(",") : []
};

export { config };
