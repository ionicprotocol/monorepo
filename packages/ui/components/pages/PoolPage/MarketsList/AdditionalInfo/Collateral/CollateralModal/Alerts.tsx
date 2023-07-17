import { Banner } from '@ui/components/shared/Banner';
import type { MarketData } from '@ui/types/TokensDataMap';

export const Alerts = ({ asset }: { asset: MarketData }) => {
  return (
    <Banner
      alertDescriptionProps={{ fontSize: 'md' }}
      alertProps={{ status: 'info' }}
      descriptions={[
        {
          text: `${
            asset.membership ? 'Disabling' : 'Enabling'
          } this asset as collateral affecting your borrowing power`
        }
      ]}
    />
  );
};
