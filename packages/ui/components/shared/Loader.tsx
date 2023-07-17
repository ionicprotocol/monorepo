import { Box } from '@chakra-ui/react';
import { motion, useAnimationControls } from 'framer-motion';
import { useEffect } from 'react';

function Loader({ width }: { width?: string }) {
  const controls = useAnimationControls();

  useEffect(() => {
    controls.start((i) => ({
      fillOpacity: [0, 0, 1, 1, 0, 0],
      opacity: [0, 1, 1, 1, 1, 0],
      pathLength: [0, 1, 1, 1, 1, 0],
      transition: {
        delay: i * 0.2,
        duration: 2,
        ease: 'easeIn',
        repeat: Infinity,
        repeatDelay: 0.5,
        repeatType: 'reverse'
      }
    }));
  }, [controls]);

  return (
    <Box width={width ? width : '150px'}>
      <motion.svg fill="#BCAC83" height="130px" width="150px">
        <motion.path
          animate={controls}
          custom={0}
          d="m14.9 0.4h110.8c7.5 0 13.5 5 14.7 12.4 1 6-2.1 12.3-7.7 15.3s-12.5 2-16.9-2.3c-2.2-2.1-2.4-5.2-0.4-7.4 1.9-2.1 5-2.3 7.3-0.4 1.4 1.2 2.9 1.7 4.7 1s2.8-2.4 2.7-4.4c-0.1-1.8-1.5-3.4-3.3-3.8-0.5-0.1-1-0.1-1.5-0.1h-109.7c-1.5 0-2.9 0.4-3.9 1.6-1.4 1.7-1.3 4 0.2 5.6s3.9 1.8 5.7 0.5c0.8-0.6 1.6-1.3 2.6-1.6 2.3-0.6 4.7 0.4 5.9 2.4s0.9 4.4-0.8 6.2c-5.1 5.3-14.2 5.7-19.8 0.8-6.2-5.5-7-14.2-1.5-20.8 2.8-3.3 6.5-5 10.9-5z"
          initial={{
            opacity: 0,
            pathLength: 1
          }}
          stroke="#BCAC83"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          style={{ x: '4px', y: '4px' }}
        />
        <motion.path
          animate={controls}
          custom={0}
          d="m75.7 83.4v31.3c0 1.8-0.4 3.3-1.8 4.6-1.5 1.3-3.2 1.6-5 1.1-1.8-0.6-3-1.8-3.5-3.7-0.2-0.9-0.2-1.8-0.2-2.7v-61.8c0-1.9 0-1.9-1.9-1.9h-8.5c-1.8 0-1.8 0-1.8 1.9v38.7c0 1.2-0.1 2.4-0.7 3.5-1 1.8-3 3-5 2.8-2.1-0.2-4-1.7-4.5-3.8-0.2-0.8-0.3-1.6-0.3-2.3v-45.2c0-3.9 2.1-6 5.9-6 14.7 0 29.4 0.1 44.1 0 3.5 0 6 2.4 6 6-0.1 15.2 0 30.4 0 45.5 0 4-3.3 6.7-6.8 5.6-2.2-0.7-3.6-2.7-3.7-5.4-0.1-2.6 0-5.2 0-7.9v-31.4c0-2 0-2-2-2h-8.8c-1.2 0-1.5 0.4-1.5 1.5 0.1 10.5 0 21 0 31.6z"
          initial={{
            opacity: 0,
            pathLength: 1
          }}
          stroke="#BCAC83"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          style={{ x: '4px', y: '4px' }}
        />
        <motion.path
          animate={controls}
          custom={0}
          d="m70.5 30.8h-31.2c-3.8 0-6.3-3.6-5-7.1 0.8-2 2.6-3.2 5-3.2h62.4c3.8 0 6.2 3.5 5 7-0.8 2.1-2.7 3.4-5.2 3.4-10.3-0.1-20.7-0.1-31-0.1z"
          initial={{
            opacity: 0,
            pathLength: 1
          }}
          stroke="#BCAC83"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          style={{ x: '4px', y: '4px' }}
        />
      </motion.svg>
    </Box>
  );
}

export default Loader;
