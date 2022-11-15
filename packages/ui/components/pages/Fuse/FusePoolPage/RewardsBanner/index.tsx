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
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{ width: '100%' }}
    >
      <GradientButton isSelected width="100%" height="50px" justifyContent="flex-start" mt={4}>
        <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" h="100%" w="100" p={3}>
          <Text variant="smText" ml={2} mt="2px">
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
      </GradientButton>
    </motion.div>
  );
};
