import { Box, Image } from '@chakra-ui/react';
import { motion } from 'framer-motion';

function Loader({ width }: { width?: string }) {
  return (
    <Box width={width ? width : '150px'}>
      <motion.div
        animate={{
          rotate: [0, 360],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 1,
          ease: 'linear',
          times: [0, 1],
          repeat: Infinity,
          repeatDelay: 0,
        }}
      >
        <Box justifyContent="center" alignContent="center">
          <Image width={width ? width : '150px'} src="/images/loading.svg" alt="loading..." />
        </Box>
      </motion.div>
    </Box>
  );
}

export default Loader;
