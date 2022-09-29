import { AvatarGroup, Button, chakra, Flex, Text } from '@chakra-ui/react';
import { FusePoolData } from '@midas-capital/types';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import { Column, Row } from '@ui/components/shared/Flex';
import { useMidas } from '@ui/context/MidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { smallUsdFormatter } from '@ui/utils/bigUtils';

interface PoolCardProps {
  data: FusePoolData;
  isMostSupplied?: boolean;
}

const PoolCard = ({ data }: PoolCardProps) => {
  const tokens = useMemo(() => {
    return data.underlyingTokens.map((address, index) => ({
      address,
      symbol: data.underlyingSymbols[index],
    }));
  }, [data.underlyingSymbols, data.underlyingTokens]);

  const { cCard } = useColors();

  const router = useRouter();
  const { setLoading, currentChain, coingeckoId } = useMidas();

  const { data: usdPrice } = useUSDPrice(coingeckoId);
  return (
    <motion.div whileHover={{ scale: 1.05 }}>
      <Flex
        w="100%"
        key={data.id}
        pt={6}
        bgColor={cCard.bgColor}
        borderColor={cCard.borderColor}
        borderWidth={4}
        borderRadius={12}
        flexDir="column"
        gridGap="6"
      >
        <Row
          mainAxisAlignment="space-between"
          crossAxisAlignment="flex-start"
          gridGap="6"
          mx="6"
          justifyContent="center"
        >
          <Text fontWeight="bold" variant="lgText" ml="2" color={cCard.txtColor}>
            {data.name}
          </Text>
        </Row>
        <Row crossAxisAlignment="center" mainAxisAlignment="space-between" mx="6">
          {data.underlyingTokens.length === 0 ? null : (
            <AvatarGroup size="sm" max={30}>
              {tokens.slice(0, 10).map(({ address }) => {
                return <CTokenIcon key={address} address={address} />;
              })}
            </AvatarGroup>
          )}
        </Row>
        <chakra.div w="100%" h="1px" bgColor={cCard.dividerColor} />
        <Row mx="6" mainAxisAlignment="center" crossAxisAlignment="center" gridGap="6">
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" color={cCard.txtColor}>
            <Text variant="smText" textAlign="center">
              Total Supply
            </Text>
            <Text mt="1.5" fontWeight="bold" variant="smText">
              {usdPrice && smallUsdFormatter(data.totalSuppliedNative * usdPrice)}
            </Text>
          </Column>
          <chakra.div h="16" w="1px" bgColor={cCard.dividerColor} />
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" color={cCard.txtColor}>
            <Text variant="smText" textAlign="center">
              Total borrowed
            </Text>
            <Text mt="1.5" fontWeight="bold" variant="smText">
              {usdPrice && smallUsdFormatter(data.totalBorrowedNative * usdPrice)}
            </Text>
          </Column>
        </Row>
        <chakra.div w="100%" h="1px" bgColor={cCard.dividerColor} />
        <Row mx="6" mainAxisAlignment="center" crossAxisAlignment="center" gridGap="6">
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" color={cCard.txtColor}>
            <Text variant="smText" textAlign="center">
              Your Supply <br></br> Balance
            </Text>
            <Text mt="1.5" fontWeight="bold" variant="smText">
              {usdPrice && smallUsdFormatter(data.totalSupplyBalanceNative * usdPrice)}
            </Text>
          </Column>
          <chakra.div h="16" w="1px" bgColor={cCard.dividerColor} />
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" color={cCard.txtColor}>
            <Text variant="smText" textAlign="center">
              Your borrowed <br></br> Balance
            </Text>
            <Text mt="1.5" fontWeight="bold" variant="smText">
              {usdPrice && smallUsdFormatter(data.totalBorrowBalanceNative * usdPrice)}
            </Text>
          </Column>
        </Row>
        <Row py="6" mainAxisAlignment="center" crossAxisAlignment="center">
          <Button
            onClick={() => {
              setLoading(true);
              router.push(`/${currentChain.id}/pool/` + data.id);
            }}
          >
            View Details
          </Button>
        </Row>
      </Flex>
    </motion.div>
  );
};

export default PoolCard;
