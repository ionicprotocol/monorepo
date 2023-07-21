import { useEffect, useState } from 'react';

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    height: 1080,
    width: 1920
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        height: window.innerHeight,
        width: window.innerWidth
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

const useIsMobile = () => {
  const { width } = useWindowSize();

  return width < 768;
};

const useIsSmallScreen = () => {
  const { width } = useWindowSize();

  return width < 1030;
};

const useIsSemiSmallScreen = () => {
  const { width } = useWindowSize();

  return width < 1180;
};

const useIsSm = () => {
  const { width } = useWindowSize();

  return width < 480;
};

export { useIsMobile, useIsSmallScreen, useIsSemiSmallScreen, useIsSm, useWindowSize };
