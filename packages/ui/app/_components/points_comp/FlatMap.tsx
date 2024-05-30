import React, { useMemo } from 'react';

interface IFlatMap {
  colorData?: string[];
  rewardsData?: number[];
}
const FlatMap = ({
  rewardsData = [10, 30, 30, 15, 5],
  colorData = ['#3bff89ff', '#f3fa96', '#f3fa96', '#f3fa96', '#f3fa96']
}: IFlatMap) => {
  const totalSum: number = rewardsData.reduce((acc, curr) => acc + curr, 0);
  function calculatePercentages(numbers: number[], total: number): number[] {
    return numbers.map(
      (number: number) => +((number / total) * 100).toFixed(1) || 0
    );
  }
  const percentVals = useMemo(() => {
    return calculatePercentages(rewardsData, totalSum);
  }, [rewardsData, totalSum]);

  return (
    <div
      className={`w-full bg-grayUnselect rounded-xl overflow-hidden flex h-3`}
    >
      {percentVals.map((vals: number, idx: number) => (
        <span
          className={` h-3`}
          key={idx}
          style={{ backgroundColor: `${colorData[idx]}`, width: `${vals}%` }}
        >
          {' '}
        </span>
      ))}
    </div>
  );
};

export default FlatMap;
