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
import type { VaultInfo } from '@ui/hooks/vault/useAllVaultsApyInfo';

type LineProps = {
  [key: string]: boolean | string | null;
};

const VaultChart = ({ vaultApyInfo }: { vaultApyInfo: VaultInfo }) => {
  const keys = vaultApyInfo.length > 0 ? Object.keys(vaultApyInfo[0]) : [];

  const supplyApyColor = useColorModeValue('#00B5D8', 'cyan'); // #00B5D8 = cyan.500
  const totalSupplyColor = useColorModeValue('#DD6B20', 'orange'); // #DD6B20 = orange.500
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
      <AreaChart data={vaultApyInfo} margin={{ bottom: 10, left: 20, right: 20, top: 10 }}>
        <CartesianGrid strokeWidth={0} />
        <XAxis
          minTickGap={10}
          padding={{ left: 0, right: 10 }}
          tick={{ fill: cCard.txtColor, fillOpacity: 0.5 }}
          tickFormatter={(label) => `${label}%`}
          ticks={[0, 25, 50, 75, 100]}
        >
          <Label fill={cCard.txtColor} offset={-10} position="insideBottom" value="Utilization" />
        </XAxis>
        <YAxis
          domain={[0, 110]}
          tick={{ fill: cCard.txtColor, fillOpacity: 0.5 }}
          tickFormatter={(label) => `${label}%`}
          ticks={[0, 50, 100]}
        >
          <Label angle={-90} fill={cCard.txtColor} offset={0} position="insideLeft" value="Rate" />
        </YAxis>
        <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
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
              dataKey={keys[1]}
              dot={{ r: 0 }}
              fill={supplyApyColor}
              fillOpacity={0.2}
              hide={lineProps[keys[1]] === true}
              name="Supply Rate"
              opacity={Number(lineProps.hover === keys[1] || !lineProps.hover ? 1 : 0.2)}
              stroke={supplyApyColor}
              strokeWidth={3}
              type="monotone"
            />
            <Area
              activeDot={{ r: 5, strokeWidth: 0 }}
              dataKey={keys[3]}
              dot={{ r: 0 }}
              fill={totalSupplyColor}
              fillOpacity={0.2}
              hide={lineProps[keys[3]] === true}
              name="Borrow Rate"
              opacity={Number(lineProps.hover === keys[3] || !lineProps.hover ? 1 : 0.2)}
              stroke={totalSupplyColor}
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
  const { active, payload, label } = props;

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
        >{`${label}%`}</Text>
        {payload[3] && (
          <HStack alignSelf="flex-start" color={payload[3].color} p={2}>
            <Text>{payload[3].name}: </Text>
            <Text fontWeight="bold">{Number(payload[3].value).toFixed(2)}%</Text>
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

export default VaultChart;
