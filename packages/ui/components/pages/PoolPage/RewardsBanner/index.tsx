import { Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';

import { Row } from '@ui/components/shared/Flex';
import { GradientButton } from '@ui/components/shared/GradientButton';
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
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0, y: 40 }}
      style={{ width: '100%' }}
    >
      <GradientButton height="50px" isSelected justifyContent="flex-start" mt={4} width="100%">
        <Row crossAxisAlignment="center" h="100%" mainAxisAlignment="flex-start" p={3} w="100">
          <Text ml={2} mt="2px" size="md">
            This pool is offering rewards
          </Text>
          <TokenIconGroup
            chainId={poolChainId}
            ml={2}
            mr={2}
            popOnHover={true}
            tokenAddresses={tokens}
          />
        </Row>
      </GradientButton>
    </motion.div>
  );
};
