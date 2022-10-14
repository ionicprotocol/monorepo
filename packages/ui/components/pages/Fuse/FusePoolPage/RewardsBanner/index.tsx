import { Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';

import { Row } from '@ui/components/shared/Flex';
import { GlowingBox } from '@ui/components/shared/GlowingBox';
import { TokenIconGroup } from '@ui/components/shared/TokenIconGroup';

export const RewardsBanner = ({
  tokens = [],
  poolChainId,
}: {
  tokens: string[];
  poolChainId: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{ width: '100%' }}
    >
      <GlowingBox w="100%" h="50px" mt={4}>
        <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" h="100%" w="100" p={3}>
          <Text variant="smText" ml={2}>
            This pool is offering rewards
          </Text>
          <TokenIconGroup
            tokenAddresses={tokens}
            ml={2}
            mr={2}
            popOnHover={true}
            chainId={poolChainId}
          />
        </Row>
      </GlowingBox>
    </motion.div>
  );
};
