/*  This is a dynamically imported component on client-side only */

import Chart from 'react-apexcharts';

import { useColors } from '@hooks/useColors';
import { FuseIRMDemoChartOptions } from '@utils/chartOptions';

type AddAssetChartProps = {
  tokenData: any;
  curves: {
    borrowerRates: Array<object>;
    supplierRates: Array<object>;
  };
};

const AddAssetChart = ({ curves }: AddAssetChartProps) => {
  const { borrowLineColor, tokenLineColor } = useColors();
  return (
    <Chart
      options={{
        ...FuseIRMDemoChartOptions,
        colors: [borrowLineColor, tokenLineColor],
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
