/*  This is a dynamically imported component on client-side only */

import Chart from 'react-apexcharts';

import { useColors } from '@hooks/useColors';
import { TokenData } from '@hooks/useTokenData';
import { FuseIRMDemoChartOptions } from '@utils/chartOptions';

type AddAssetChartProps = {
  tokenData: TokenData;
  curves: {
    borrowerRates: Array<{ x: number; y: number }>;
    supplierRates: Array<{ x: number; y: number }>;
  };
};

const AddAssetChart = ({ curves }: AddAssetChartProps) => {
  const { cChart } = useColors();
  return (
    <Chart
      options={{
        ...FuseIRMDemoChartOptions,
        colors: [cChart.borrowColor, cChart.tokenColor],
      }}
      type="line"
      width="100%"
      height="100%"
      series={[
        {
          name: 'Borrow Rate',
          data: curves.borrowerRates,
        },
        {
          name: 'Deposit Rate',
          data: curves.supplierRates,
        },
      ]}
    />
  );
};

export default AddAssetChart;
