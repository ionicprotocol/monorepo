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

const HistoricalAPYChart = ({
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
    <ResponsiveContainer height="100%" width="100%">
      <AreaChart data={irmToCurve.rates} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
        <CartesianGrid strokeWidth={0} />
        <XAxis
          minTickGap={10}
          padding={{ left: 0, right: 10 }}
          tick={{ fill: cCard.txtColor, fillOpacity: 0.5 }}
          tickFormatter={(label) => `${label}%`}
          ticks={[0, 25, 50, 75, 100]}
        >
          <Label fill={cCard.txtColor} offset={-10} position="insideBottom" value="Date" />
        </XAxis>
        <YAxis
          domain={[0, 110]}
          tick={{ fill: cCard.txtColor, fillOpacity: 0.5 }}
          tickFormatter={(label) => `${label}%`}
          ticks={[0, 50, 100]}
        >
          <Label
            angle={-90}
            fill={cCard.txtColor}
            offset={0}
            position="insideLeft"
            value="Supply"
          />
        </YAxis>
        <Tooltip
          content={<CustomTooltip currentUtilization={currentUtilization} />}
          wrapperStyle={{ outline: 'none' }}
        />

        {/* <ReferenceLine y={150} label="Max" stroke="red" strokeDasharray="3 3" /> */}
        <Legend
          content={
            <CustomLegend
              handleLegendMouseEnter={handleLegendMouseEnter}
              handleLegendMouseLeave={handleLegendMouseLeave}
              lineProps={lineProps}
              selectLine={selectLine}
            />
          }
          verticalAlign="top"
        />
        {keys.length > 0 && (
          <>
            <Area
              activeDot={{ strokeWidth: 0, r: 5 }}
              dataKey={keys[1]}
              dot={{ r: 0 }}
              fill={supplyRateColor}
              fillOpacity={0.2}
              hide={lineProps[keys[1]] === true}
              name="Supply APY"
              opacity={Number(lineProps.hover === keys[1] || !lineProps.hover ? 1 : 0.2)}
              stroke={supplyRateColor}
              strokeWidth={3}
              type="monotone"
            />
            <Area
              activeDot={{ strokeWidth: 0, r: 5 }}
              dataKey={keys[2]}
              dot={{ r: 0 }}
              fill={borrowRateColor}
              fillOpacity={0.2}
              hide={lineProps[keys[2]] === true}
              name="Supply Balance"
              opacity={Number(lineProps.hover === keys[2] || !lineProps.hover ? 1 : 0.2)}
              stroke={borrowRateColor}
              strokeWidth={3}
              type="monotone"
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
        bgColor={cCard.bgColor}
        borderColor={cCard.borderColor}
        borderRadius={4}
        borderWidth={2}
        spacing={0}
      >
        <Text
          bgColor="ecru20alpha"
          borderBottomColor={cCard.borderColor}
          borderBottomWidth={1}
          fontWeight="bold"
          p={2}
          textAlign="left"
          width="100%"
        >{`${label}% Utilization${
          label.toString() === currentUtilization ? ' (Current)' : ''
        }`}</Text>
        {payload[0] && (
          <HStack alignSelf="flex-start" color={payload[0].color} p={2}>
            <Text>{payload[0].name}: </Text>
            <Text fontWeight="bold">{Number(payload[0].value).toFixed(2)}%</Text>
          </HStack>
        )}
        {payload[1] && (
          <HStack alignSelf="flex-start" color={payload[1].color} pb={2} px={2}>
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
              cursor="pointer"
              key={index}
              onClick={() => selectLine(item.dataKey)}
              onMouseEnter={() => handleLegendMouseEnter(item.dataKey)}
              onMouseLeave={() => handleLegendMouseLeave()}
              pb={4}
            >
              <AiOutlineLineChart
                color={lineProps[item.dataKey] ? cCard.txtColor : item.color}
                fontSize={20}
              />
              <Text color={lineProps[item.dataKey] ? cCard.txtColor : item.color} pb={1} pt={2}>
                {item.value}
              </Text>
            </HStack>
          );
        })}
    </HStack>
  );
};

export default HistoricalAPYChart;
