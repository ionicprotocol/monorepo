export const useAuthedCallback = (callback: () => void) => {
  return () => {
    return callback();
  };
};
