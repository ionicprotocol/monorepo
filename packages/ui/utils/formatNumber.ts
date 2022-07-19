export const toFixedNoRound = (value: number, len: number) => {
  const factor = Math.pow(10, len);
  return (Math.floor(value * factor) / factor).toString();
};
