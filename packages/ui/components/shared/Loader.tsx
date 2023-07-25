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
      <motion.svg fill="#39FF88" height="148px" width="155px">
        <motion.path
          animate={controls}
          custom={0}
          d="M 75 143 C 89.832031 143 104.335938 138.808594 116.667969 130.949219 C 129 123.09375 138.613281 111.925781 144.289062 98.863281 C 149.96875 85.796875 151.453125 71.421875 148.558594 57.550781 C 145.664062 43.679688 138.523438 30.941406 128.03125 20.941406 C 117.542969 10.941406 104.179688 4.132812 89.632812 1.375 C 75.082031 -1.386719 60.003906 0.03125 46.296875 5.441406 C 32.59375 10.855469 20.882812 20.019531 12.640625 31.777344 C 4.398438 43.535156 0 57.359375 0 71.5 L 31.820312 71.5 C 31.820312 63.03125 32.726562 54.753906 37.660156 47.714844 C 42.59375 40.671875 49.609375 35.1875 57.8125 31.945312 C 66.019531 28.707031 75.050781 27.859375 83.761719 29.507812 C 92.472656 31.160156 100.472656 35.238281 106.753906 41.226562 C 113.035156 47.214844 117.3125 54.84375 119.046875 63.148438 C 120.777344 71.453125 119.890625 80.0625 116.492188 87.882812 C 113.089844 95.707031 107.335938 102.394531 99.949219 107.097656 C 92.566406 111.800781 83.882812 114.3125 75 114.3125 Z M 75 143"
          initial={{
            opacity: 0,
            pathLength: 1
          }}
          stroke="#39FF88"
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
