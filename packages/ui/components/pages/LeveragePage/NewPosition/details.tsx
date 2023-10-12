import { ArrowBackIcon } from '@chakra-ui/icons';
import { Flex, HStack, Img, Skeleton, Text, VStack } from '@chakra-ui/react';
import type { LeveredPosition } from '@ionicprotocol/types';
import { utils } from 'ethers';
import { useRouter } from 'next/router';

import { CardBox } from '@ui/components/shared/IonicBox';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useChainConfig } from '@ui/hooks/useChainConfig';

const Details = ({ position }: { position: LeveredPosition }) => {
  const { collateral, chainId } = position;
  const router = useRouter();
  const { setGlobalLoading } = useMultiIonic();
  const chainConfig = useChainConfig(Number(chainId));

  return (
    <CardBox mb={'20px'}>
      <Flex
        alignItems="center"
        flexWrap="wrap"
        gap={4}
        justifyContent={['center', 'center', 'space-between']}
        mb={'20px'}
        width="100%"
      >
        <HStack spacing={4}>
          <ArrowBackIcon
            cursor="pointer"
            fontSize="2xl"
            fontWeight="extrabold"
            onClick={() => {
              setGlobalLoading(true);
              router.back();
            }}
          />
          {chainConfig ? (
            <>
              <Img
                alt={chainConfig.specificParams.metadata.name}
                borderRadius="50%"
                height="35px"
                minHeight="35px"
                minWidth="35px"
                src={chainConfig.specificParams.metadata.img}
                width="35px"
              />
              <Text size="xl" textAlign="left">
                {chainConfig.specificParams.metadata.name}
              </Text>
            </>
          ) : null}
        </HStack>
      </Flex>

      <Flex direction={{ base: 'column' }} width={'100%'}>
        <Flex flexWrap="wrap" gap="32px">
          <VStack alignItems="flex-start" gap={0}>
            <Text variant={'itemTitle'}>Protocol</Text>
            <Skeleton isLoaded={true}>
              <Text size={'lg'} variant={'itemDesc'}>
                Protocol
              </Text>
            </Skeleton>
          </VStack>
          <VStack alignItems="flex-start" gap={0}>
            <Text variant={'itemTitle'}>TVL</Text>
            <Skeleton isLoaded={true}>
              <Text size={'lg'} variant={'itemDesc'}>
                {utils.formatUnits(collateral.totalSupplied)}
              </Text>
            </Skeleton>
          </VStack>
          <VStack alignItems="flex-start" gap={0}>
            <Text variant={'itemTitle'}>Ionic TVL</Text>
            <Skeleton isLoaded={true}>
              <Text size={'lg'} variant={'itemDesc'}>
                250,046.94 / 250000.00
              </Text>
            </Skeleton>
          </VStack>
        </Flex>
      </Flex>
    </CardBox>
  );
};

export default Details;
