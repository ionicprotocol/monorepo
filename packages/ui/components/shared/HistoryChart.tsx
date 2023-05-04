/* eslint-disable @typescript-eslint/no-explicit-any */
import { Grid, HStack, Text, useColorModeValue, VStack } from '@chakra-ui/react';
import type { ChartData } from '@midas-capital/types';
import moment from 'moment';
import { useMemo, useState } from 'react';
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

import { APY, MILLI_SECONDS_PER_DAY } from '@ui/constants/index';
import { useColors } from '@ui/hooks/useColors';
import { smallFormatter } from '@ui/utils/bigUtils';

type LineProps = {
  [key: string]: boolean | string | null;
};

const HistoryChart = ({
  historyData,
  milliSeconds,
  mode,
}: {
  historyData: ChartData[];
  milliSeconds: number;
  mode: string;
}) => {
  const [min, max, length] = useMemo(() => {
    const yVaules: number[] = [];

    historyData.map((data) => {
      Object.keys(data)
        .filter((key) => key !== 'createdAt')
        .map((key) => {
          yVaules.push(data[key]);
        });
    });

    return [Math.min(...yVaules), Math.max(...yVaules), historyData.length];
  }, [historyData]);
  const keys = historyData.length > 0 ? Object.keys(historyData[0]) : [];
  const colors: any = {
    ankrBNBApr: useColorModeValue('#B83280', '#F687B3'),
    borrowApy: useColorModeValue('#DD6B20', 'orange'),
    compoundingApy: useColorModeValue('#2C7A7B', '#4FD1C5'),
    price: useColorModeValue('#38A169', '#9AE6B4'),
    rewardApy: useColorModeValue('#6B46C1', '#B794F4'),
    supplyApy: useColorModeValue('#38A169', '#9AE6B4'),
    totalSupplyApy: useColorModeValue('#00B5D8', 'cyan'),
    tvl: useColorModeValue('#38A169', '#9AE6B4'),
  };

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
      hover: null,
      [key]: !lineProps[key],
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
      <AreaChart data={historyData} margin={{ bottom: 10, left: 20, right: 40, top: -40 }}>
        <CartesianGrid strokeWidth={0} />
        <XAxis
          minTickGap={10}
          padding={{ left: 0, right: 10 }}
          tick={<CustomXAxisTick historyData={historyData} milliSeconds={milliSeconds} />}
          ticks={[
            0,
            Math.floor(length / 4),
            Math.floor(length / 2),
            Math.floor((length * 3) / 4),
            Math.floor(length - 1),
          ]}
        >
          <Label fill={cCard.txtColor} offset={0} position="insideBottom" value="" />
        </XAxis>
        <YAxis
          domain={[0, Math.ceil(max * 1.5)]}
          tick={<CustomYAxisTick mode={mode} />}
          ticks={[Math.floor(min), Math.ceil((min + max) / 2), Math.ceil(max)]}
        >
          <Label angle={-90} fill={cCard.txtColor} offset={0} position="insideLeft" value="" />
        </YAxis>
        <Tooltip
          content={<CustomTooltip historyData={historyData} mode={mode} />}
          wrapperStyle={{ outline: 'none' }}
        />
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
        {keys.length > 0 &&
          keys.map((key, i) =>
            key !== 'createdAt' ? (
              <Area
                activeDot={{ r: 5, strokeWidth: 0 }}
                dataKey={key}
                dot={{ r: 0 }}
                fill={colors[key]}
                fillOpacity={0.2}
                hide={lineProps[key] === true}
                key={i}
                name={key}
                opacity={Number(lineProps.hover === key || !lineProps.hover ? 1 : 0.2)}
                stroke={colors[key]}
                strokeWidth={3}
                type="monotone"
              />
            ) : null
          )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

const CustomXAxisTick = (props: any) => {
  const { x, y, payload, historyData, milliSeconds } = props;
  const { cCard } = useColors();

  return (
    <g transform={`translate(${x},${y})`}>
      <text fill={cCard.txtColor} fillOpacity={0.5} textAnchor="start" x={-20} y={20}>
        {moment(historyData[payload.value].createdAt).format(
          milliSeconds === MILLI_SECONDS_PER_DAY ? 'HH:mm' : 'MM/DD'
        )}
      </text>
    </g>
  );
};

const CustomYAxisTick = (props: any) => {
  const { x, y, payload, mode } = props;
  const { cCard } = useColors();

  return (
    <g transform={`translate(${x},${y})`}>
      <text fill={cCard.txtColor} fillOpacity={0.5} textAnchor="end" x={0} y={0}>
        {mode !== APY ? '$' : ''}
        {smallFormatter(payload.value, true)}
        {mode === APY ? '%' : ''}
      </text>
    </g>
  );
};

const CustomTooltip = (props: any) => {
  const { cCard } = useColors();
  const { active, payload, label, historyData, mode } = props;

  if (active && payload && payload.length) {
    return (
      <VStack
        bgColor={cCard.bgColor}
        borderColor={cCard.borderColor}
        borderRadius={4}
        borderWidth={2}
        spacing={2}
      >
        <Text
          bgColor="ecru20alpha"
          borderBottomColor={cCard.borderColor}
          borderBottomWidth={1}
          fontWeight="bold"
          p={2}
          textAlign="left"
          width="100%"
        >{`${moment(historyData[label].createdAt).format('YYYY-MM-DD HH:mm')}`}</Text>
        {payload.map((pl: any, i: number) => (
          <HStack alignSelf="flex-start" key={i} px={2}>
            <Text color={pl.color}>{pl.name}: </Text>
            <Text color={pl.color} fontWeight="bold">
              {mode !== APY ? '$' : ''}
              {smallFormatter(Number(pl.value))}
              {mode === APY ? '%' : ''}
            </Text>
          </HStack>
        ))}
      </VStack>
    );
  }

  return null;
};

const CustomLegend = (
  props: any & {
    handleLegendMouseEnter: (key: string) => void;
    handleLegendMouseLeave: () => void;
    lineProps: LineProps;
    selectLine: (key: string) => void;
  }
) => {
  const { payload, lineProps, selectLine, handleLegendMouseEnter, handleLegendMouseLeave } = props;
  const { cCard } = useColors();

  return (
    <VStack alignItems="flex-start" justifyContent="flex-start" ml="60px" pb={2} spacing={1}>
      <Grid columnGap={2} rowGap={2} templateColumns={{ base: 'repeat(2, 1fr)' }}>
        {payload &&
          payload.map((item: any, index: number) => {
            return (
              <HStack
                cursor="pointer"
                key={index}
                onClick={() => selectLine(item.dataKey)}
                onMouseEnter={() => handleLegendMouseEnter(item.dataKey)}
                onMouseLeave={() => handleLegendMouseLeave()}
              >
                <AiOutlineLineChart
                  color={lineProps[item.dataKey] ? cCard.txtColor : item.color}
                  fontSize={20}
                />
                <Text color={lineProps[item.dataKey] ? cCard.txtColor : item.color}>
                  {item.value}
                </Text>
              </HStack>
            );
          })}
      </Grid>
    </VStack>
  );
};

export default HistoryChart;
