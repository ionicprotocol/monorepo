/* eslint-disable @typescript-eslint/no-explicit-any */
import { HStack, Text, useColorModeValue, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { AiOutlineLineChart } from 'react-icons/ai';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useColors } from '@ui/hooks/useColors';
import { IRMToCurveData } from '@ui/types/ComponentPropsType';

type LineProps = {
  [key: string]: boolean | string | null;
};

const UtilizationChart = ({
  irmToCurve,
  currentUtilization,
}: {
  irmToCurve: IRMToCurveData;
  currentUtilization?: string;
}) => {
  const keys = irmToCurve.rates.length > 0 ? Object.keys(irmToCurve.rates[0]) : [];
  const supplyRateColor = useColorModeValue('#00B5D8', 'cyan'); // #00B5D8 = cyan.500
  const borrowRateColor = useColorModeValue('#DD6B20', 'orange'); // #DD6B20 = orange.500
  const { cCard } = useColors();

  const [lineProps, setLineProps] = useState<LineProps>(
    keys.reduce((a, key) => {
      a[key] = false;
      a['hover'] = null;

      return a;
    }, {} as LineProps)
  );

  const selectLine = (key: string) => {
    setLineProps({
      ...lineProps,
      [key]: !lineProps[key],
      hover: null,
    });
  };

  const handleLegendMouseEnter = (key: string) => {
    if (!lineProps[key]) {
      setLineProps({ ...lineProps, hover: key });
    }
  };

  const handleLegendMouseLeave = () => {
    setLineProps({ ...lineProps, hover: null });
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={irmToCurve.rates} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
        <CartesianGrid strokeWidth={0} />
        <XAxis
          ticks={[0, 25, 50, 75, 100]}
          minTickGap={10}
          padding={{ left: 0, right: 10 }}
          tickFormatter={(label) => `${label}%`}
          tick={{ fill: cCard.txtColor, fillOpacity: 0.5 }}
        >
          <Label value="Utilization" offset={-10} position="insideBottom" fill={cCard.txtColor} />
        </XAxis>
        <YAxis
          domain={[0, 110]}
          ticks={[0, 50, 100]}
          tickFormatter={(label) => `${label}%`}
          tick={{ fill: cCard.txtColor, fillOpacity: 0.5 }}
        >
          <Label angle={-90} value="Rate" offset={0} position="insideLeft" fill={cCard.txtColor} />
        </YAxis>
        <Tooltip
          wrapperStyle={{ outline: 'none' }}
          content={<CustomTooltip currentUtilization={currentUtilization} />}
        />
        {currentUtilization && (
          <ReferenceLine
            x={Number(currentUtilization)}
            stroke={cCard.txtColor}
            strokeOpacity={0.7}
            fill={cCard.txtColor}
            label={{
              value: 'Current',
              fill: cCard.txtColor,
              position: 'top',
              fillOpacity: 0.7,
            }}
          />
        )}
        {/* <ReferenceLine y={150} label="Max" stroke="red" strokeDasharray="3 3" /> */}
        <Legend
          verticalAlign="top"
          content={
            <CustomLegend
              lineProps={lineProps}
              selectLine={selectLine}
              handleLegendMouseEnter={handleLegendMouseEnter}
              handleLegendMouseLeave={handleLegendMouseLeave}
            />
          }
        />
        {keys.length > 0 && (
          <>
            <Area
              type="monotone"
              dataKey={keys[1]}
              stroke={supplyRateColor}
              strokeWidth={3}
              activeDot={{ strokeWidth: 0, r: 5 }}
              dot={{ r: 0 }}
              name="Supply Rate"
              hide={lineProps[keys[1]] === true}
              opacity={Number(lineProps.hover === keys[1] || !lineProps.hover ? 1 : 0.2)}
              fillOpacity={0.2}
              fill={supplyRateColor}
            />
            <Area
              type="monotone"
              dataKey={keys[2]}
              stroke={borrowRateColor}
              strokeWidth={3}
              activeDot={{ strokeWidth: 0, r: 5 }}
              dot={{ r: 0 }}
              name="Borrow Rate"
              hide={lineProps[keys[2]] === true}
              opacity={Number(lineProps.hover === keys[2] || !lineProps.hover ? 1 : 0.2)}
              fillOpacity={0.2}
              fill={borrowRateColor}
            />
          </>
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

const CustomTooltip = (props: any) => {
  const { cCard } = useColors();
  const { active, payload, label, currentUtilization } = props;

  if (active && payload && payload.length) {
    return (
      <VStack
        borderWidth={2}
        borderColor={cCard.borderColor}
        bgColor={cCard.bgColor}
        borderRadius={4}
        spacing={0}
      >
        <Text
          fontWeight="bold"
          width="100%"
          p={2}
          borderBottomWidth={1}
          borderBottomColor={cCard.borderColor}
          textAlign="left"
          bgColor="ecru20alpha"
        >{`${label}% Utilization${
          label.toString() === currentUtilization ? ' (Current)' : ''
        }`}</Text>
        {payload[0] && (
          <HStack color={payload[0].color} p={2} alignSelf="flex-start">
            <Text>{payload[0].name}: </Text>
            <Text fontWeight="bold">{Number(payload[0].value).toFixed(2)}%</Text>
          </HStack>
        )}
        {payload[1] && (
          <HStack color={payload[1].color} px={2} pb={2} alignSelf="flex-start">
            <Text>{payload[1].name}: </Text>
            <Text fontWeight="bold">{Number(payload[1].value).toFixed(2)}%</Text>
          </HStack>
        )}
      </VStack>
    );
  }

  return null;
};

const CustomLegend = (
  props: any & {
    lineProps: LineProps;
    selectLine: (key: string) => void;
    handleLegendMouseEnter: (key: string) => void;
    handleLegendMouseLeave: () => void;
  }
) => {
  const { payload, lineProps, selectLine, handleLegendMouseEnter, handleLegendMouseLeave } = props;
  const { cCard } = useColors();

  return (
    <HStack justifyContent="center" spacing={12}>
      {payload &&
        payload.map((item: any, index: number) => {
          return (
            <HStack
              key={index}
              cursor="pointer"
              onClick={() => selectLine(item.dataKey)}
              onMouseEnter={() => handleLegendMouseEnter(item.dataKey)}
              onMouseLeave={() => handleLegendMouseLeave()}
              pb={4}
            >
              <AiOutlineLineChart
                fontSize={20}
                color={lineProps[item.dataKey] ? cCard.txtColor : item.color}
              />
              <Text pt={2} pb={1} color={lineProps[item.dataKey] ? cCard.txtColor : item.color}>
                {item.value}
              </Text>
            </HStack>
          );
        })}
    </HStack>
  );
};

export default UtilizationChart;
