import { Box, Button, HStack, Img, Link, Stack, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { GradientText } from '@ui/components/shared/GradientText';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { usePoolClaimableRewards } from '@ui/hooks/rewards/usePoolClaimableRewards';
import { useChainConfig } from '@ui/hooks/useChainConfig';
import { useColors } from '@ui/hooks/useColors';

export const Asset = ({
  comptroller,
  chainId,
  poolName,
  poolId,
  isDisabledTooltip,
}: {
  chainId: number;
  comptroller: string;
  isDisabledTooltip?: boolean;
  poolId: number;
  poolName: string;
}) => {
  const { setGlobalLoading } = useMultiIonic();
  const { data: claimableRewards } = usePoolClaimableRewards(comptroller, chainId);
  const { cCard, cIRow } = useColors();
  const router = useRouter();
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const chainConfig = useChainConfig(chainId);

  return (
    <HStack height="100%" justifyContent="flex-start">
      {chainConfig && (
        <SimpleTooltip label={chainConfig.specificParams.metadata.name}>
          <Img
            alt={chainConfig.specificParams.metadata.name}
            borderRadius="50%"
            height="25px"
            minHeight="25px"
            minWidth="25px"
            src={chainConfig.specificParams.metadata.img}
            width="25px"
          />
        </SimpleTooltip>
      )}
      <VStack alignItems={'flex-start'} height="100%" justifyContent="center" spacing={0}>
        <Stack maxWidth={'300px'} minWidth={'240px'}>
          <SimpleTooltip label={!isDisabledTooltip ? poolName : ''}>
            <Button
              as={Link}
              height="auto"
              m={0}
              maxWidth="100%"
              minWidth={6}
              onClick={(e) => {
                e.stopPropagation();
                setGlobalLoading(true);
                router.push(`/${chainId}/pool/${poolId}`);
              }}
              onMouseEnter={() => {
                setIsHovering(true);
              }}
              onMouseLeave={() => {
                setIsHovering(false);
              }}
              p={0}
              variant="_link"
              width="fit-content"
            >
              <Box maxWidth="100%" width="fit-content">
                <GradientText
                  _hover={{ color: cCard.borderColor }}
                  fontWeight="bold"
                  isEnabled={
                    claimableRewards && claimableRewards.length > 0 && !isHovering ? true : false
                  }
                  maxWidth="100%"
                  overflow="hidden"
                  size="md"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  width="fit-content"
                >
                  {poolName}
                </GradientText>
              </Box>
            </Button>
          </SimpleTooltip>
        </Stack>
      </VStack>
    </HStack>
  );
};
