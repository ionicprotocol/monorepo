/* eslint-disable @typescript-eslint/no-explicit-any */
import { Grid, HStack, Text, VStack } from '@chakra-ui/react';
import type { ChartData } from '@ionicprotocol/types';
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
  YAxis
} from 'recharts';

import { APY, MILLI_SECONDS_PER_DAY } from '@ui/constants/index';
import { useColors } from '@ui/hooks/useColors';
import { smallFormatter } from '@ui/utils/bigUtils';

type LineProps = {
  [key: string]: boolean | string | null;
};

const YAxisTitles: { [x: string]: string } = {
  ankrBNBApr: 'AnkrBNB APR',
  borrowApy: 'Borrow APY',
  compoundingApy: 'Compounding APY',
  price: 'USD Price',
  rewardApy: 'Reward APY',
  supplyApy: 'Supply APY',
  totalSupplyApy: 'Total Supply APY',
  tvl: 'TVL'
};

const HistoryChart = ({
  historyData,
  milliSeconds,
  mode
}: {
  historyData: ChartData[];
  milliSeconds: number;
  mode: string;
}) => {
  const { cGreen, cCardBg, cWhite } = useColors();
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
    ankrBNBApr: cWhite,
    borrowApy: cGreen,
    compoundingApy: cWhite,
    price: cGreen,
    rewardApy: cWhite,
    supplyApy: cWhite,
    totalSupplyApy: cGreen,
    tvl: cGreen
  };

  const { cLightGray } = useColors();

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
      [key]: !lineProps[key]
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
        <defs>
          {keys.map((key, index) => (
            <linearGradient id={key} key={index} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={colors[key]} stopOpacity={1} />
              <stop offset="100%" stopColor={cCardBg} stopOpacity={1} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid
          stroke={cLightGray}
          strokeDasharray="5 5"
          strokeOpacity={0.5}
          strokeWidth={1}
          vertical={false}
        />
        <XAxis
          minTickGap={10}
          padding={{ left: 0, right: 10 }}
          stroke={cCardBg}
          tick={<CustomXAxisTick historyData={historyData} milliSeconds={milliSeconds} />}
          ticks={[
            0,
            Math.floor(length / 4),
            Math.floor(length / 2),
            Math.floor((length * 3) / 4),
            Math.floor(length - 1)
          ]}
        >
          <Label fill={cLightGray} offset={0} position="insideBottom" value="" />
        </XAxis>
        <YAxis
          domain={[0, Math.ceil(max * 1.5)]}
          stroke={cCardBg}
          tick={<CustomYAxisTick mode={mode} />}
          ticks={[0, Math.floor(min), Math.ceil((min + max) / 2), Math.ceil(max)]}
        >
          <Label angle={-90} fill={cLightGray} offset={0} position="insideLeft" value="" />
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
                activeDot={{ r: 5, stroke: colors[key], strokeOpacity: 0.2, strokeWidth: 10 }}
                dataKey={key}
                dot={{ r: 0 }}
                fill={`url(#${key})`}
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
  const { cLightGray } = useColors();

  return (
    <g transform={`translate(${x},${y})`}>
      <text fill={cLightGray} fillOpacity={0.5} textAnchor="start" x={-20} y={20}>
        {moment(historyData[payload.value].createdAt).format(
          milliSeconds === MILLI_SECONDS_PER_DAY ? 'HH:mm' : 'MMM DD'
        )}
      </text>
    </g>
  );
};

const CustomYAxisTick = (props: any) => {
  const { x, y, payload, mode } = props;
  const { cLightGray } = useColors();

  return (
    <g transform={`translate(${x},${y})`}>
      <text fill={cLightGray} fillOpacity={0.5} textAnchor="end" x={0} y={0}>
        {mode !== APY ? '$' : ''}
        {smallFormatter(payload.value, true)}
        {mode === APY ? '%' : ''}
      </text>
    </g>
  );
};

const CustomTooltip = (props: any) => {
  const { cRowBg, cISeparator, cLightGray } = useColors();
  const { active, payload, label, historyData, mode } = props;

  if (active && payload && payload.length) {
    return (
      <VStack bgColor={cRowBg} borderColor={cRowBg} borderRadius={4} borderWidth={2} spacing={2}>
        <Text
          borderBottomColor={cISeparator}
          borderBottomWidth={1}
          color={cLightGray}
          fontWeight="bold"
          p={2}
          textAlign="left"
          width="100%"
        >{`${moment(historyData[label].createdAt).format('YYYY-MM-DD HH:mm')}`}</Text>
        {payload.map((pl: any, i: number) => (
          <HStack alignSelf="flex-start" key={i} px={2}>
            <Text color={pl.color}>{YAxisTitles[pl.name]}: </Text>
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
  const { cGray } = useColors();

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
                  color={lineProps[item.dataKey] ? cGray : item.color}
                  fontSize={20}
                />
                <Text color={lineProps[item.dataKey] ? cGray : item.color}>
                  {YAxisTitles[item.value]}
                </Text>
              </HStack>
            );
          })}
      </Grid>
    </VStack>
  );
};

export default HistoryChart;
