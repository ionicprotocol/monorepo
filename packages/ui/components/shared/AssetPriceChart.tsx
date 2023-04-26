/* eslint-disable @typescript-eslint/no-explicit-any */
import { HStack, Text, useColorModeValue, VStack } from '@chakra-ui/react';
import type { AssetPrice } from '@midas-capital/types';
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

import { useColors } from '@ui/hooks/useColors';
import { smallUsdFormatter } from '@ui/utils/bigUtils';

type LineProps = {
  [key: string]: boolean | string | null;
};

const AssetPriceChart = ({ assetPriceInfo }: { assetPriceInfo: AssetPrice[] }) => {
  const [min, max, length] = useMemo(() => {
    const usdPrices = assetPriceInfo.map((info) => info.usdPrice);

    return [Math.min(...usdPrices), Math.max(...usdPrices), assetPriceInfo.length];
  }, [assetPriceInfo]);
  const keys = assetPriceInfo.length > 0 ? Object.keys(assetPriceInfo[0]) : [];

  const usdPriceColor = useColorModeValue('#38A169', '#9AE6B4'); // #38A169 = green.500, #9AE6B4 = green.200
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
      <AreaChart data={assetPriceInfo} margin={{ bottom: 10, left: 20, right: 20, top: 10 }}>
        <CartesianGrid strokeWidth={0} />
        <XAxis
          minTickGap={10}
          padding={{ left: 0, right: 10 }}
          tick={{ fill: cCard.txtColor, fillOpacity: 0.5 }}
          tickFormatter={(index) => moment(assetPriceInfo[index].createdAt).format('MM/DD HH:mm')}
          ticks={[0, Math.floor(length / 2), Math.floor(length - 1)]}
        >
          <Label fill={cCard.txtColor} offset={-10} position="insideBottom" value="Date" />
        </XAxis>
        <YAxis
          domain={[0, Math.ceil(max * 1.5)]}
          tick={{ fill: cCard.txtColor, fillOpacity: 0.5 }}
          tickFormatter={(label) => `${smallUsdFormatter(label, true)}`}
          ticks={[0, Math.floor(min), Math.ceil(max)]}
        >
          <Label angle={-90} fill={cCard.txtColor} offset={0} position="insideLeft" value="" />
        </YAxis>
        <Tooltip
          content={<CustomTooltip assetPriceInfo={assetPriceInfo} />}
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
        {keys.length > 0 && (
          <>
            <Area
              activeDot={{ r: 5, strokeWidth: 0 }}
              dataKey={keys[0]}
              dot={{ r: 0 }}
              fill={usdPriceColor}
              fillOpacity={0.2}
              hide={lineProps[keys[0]] === true}
              name="USD Price"
              opacity={Number(lineProps.hover === keys[0] || !lineProps.hover ? 1 : 0.2)}
              stroke={usdPriceColor}
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
  const { active, payload, label, assetPriceInfo } = props;

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
        >{`${moment(assetPriceInfo[label].createdAt).format('YYYY-MM-DD HH:mm')}`}</Text>
        {payload[0] && (
          <HStack alignSelf="flex-start" p={2}>
            <Text color={payload[0].color}>{payload[0].name}: </Text>
            <Text color={payload[0].color} fontWeight="bold">
              ${Number(payload[0].value).toFixed(2)}
            </Text>
          </HStack>
        )}
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

export default AssetPriceChart;
