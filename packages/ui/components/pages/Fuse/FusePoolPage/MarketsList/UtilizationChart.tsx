import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { IRMToCurveData } from '@ui/types/ComponentPropsType';

const UtilizationChart = ({ irmToCurve }: { irmToCurve: IRMToCurveData }) => {
  const keys = irmToCurve.rates.length > 0 ? Object.keys(irmToCurve.rates[0]) : [];

  return (
    <ResponsiveContainer width="100%" height="90%">
      <LineChart data={irmToCurve.rates} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis />
        <YAxis />
        <Tooltip />
        <Legend verticalAlign="top" height={30} />
        {keys.length > 0 && (
          <>
            <Line type="monotone" dataKey={keys[1]} stroke="cyan" />
            <Line type="monotone" dataKey={keys[2]} stroke="orange" />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default UtilizationChart;
