import { Avatar } from '@chakra-ui/react';
import { motion } from 'framer-motion';

import { useTokenData } from '@hooks/useTokenData';

const CTokenIcon = ({ address, ...avatarProps }: { address: string; [key: string]: any }) => {
  const tokenData = useTokenData(address);

  return (
    <motion.div whileHover={{ scale: 1.2 }}>
      <Avatar
        {...avatarProps}
        key={address}
        bg={'transparent'}
        borderWidth="1px"
        name={tokenData?.symbol ?? 'Loading...'}
        borderColor={'transparent'}
        src={
          tokenData?.logoURL ??
          'https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg'
        }
      />
    </motion.div>
  );
};

export default CTokenIcon;
