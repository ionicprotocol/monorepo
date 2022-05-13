import { Heading } from '@chakra-ui/react';
import { Row } from '@ui/utils/chakraUtils';
import { motion } from 'framer-motion';

import { CTokenAvatarGroup } from '@ui/components/shared/CTokenIcon';
import { GlowingBox } from '@ui/components/shared/GlowingBox';

export const RewardsBanner = ({ tokens = [] }: { tokens: string[] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{ width: '100%' }}
    >
      <GlowingBox w="100%" h="50px" mt={4}>
        <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" h="100%" w="100" p={3}>
          <Heading fontSize="md" ml={2}>
            This pool is offering rewards
          </Heading>
          <CTokenAvatarGroup tokenAddresses={tokens} ml={2} mr={2} popOnHover={true} />
        </Row>
      </GlowingBox>
    </motion.div>
  );
};
