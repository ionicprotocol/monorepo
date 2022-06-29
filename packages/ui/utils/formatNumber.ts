export const toFixedNoRound = (value: number, len: number) => {
  return (Math.floor(value * Math.pow(10, len)) / Math.pow(10, len)).toFixed(len);
};
