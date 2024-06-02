'use client';

import { useEffect, useState } from 'react';
interface ITime {
  days: number;
  hours: number;
  minutes: number;
}
interface IProp {
  dropdownSelectedSeason: number;
}

const CountdownTimer = ({ dropdownSelectedSeason }: IProp) => {
  const diffSeason1 = +new Date('2024-08-31T00:00:00+00:00') - +new Date();
  const diffS1presale = +new Date('2024-08-21T00:00:00+00:00') - +new Date();

  const [timeLeft, setTimeLeft] = useState<ITime>(
    calculateTimeLeft(
      dropdownSelectedSeason === 1 ? diffSeason1 : diffS1presale
    )
  );

  useEffect(() => {
    setTimeout(() => {
      setTimeLeft(
        calculateTimeLeft(
          dropdownSelectedSeason === 1 ? diffSeason1 : diffS1presale
        )
      );
    }, 1000);
  }, [diffS1presale, diffSeason1, dropdownSelectedSeason]);

  function calculateTimeLeft(expiresAt: number) {
    let timeLeft: ITime = {
      days: 0,
      hours: 0,
      minutes: 0
    };
    if (expiresAt > 0) {
      timeLeft = {
        days: Math.floor(expiresAt / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (expiresAt % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((expiresAt % (1000 * 60 * 60)) / (1000 * 60))
      };
      //  seconds = Math.floor(
      //   (expiresAt % (1000 * 60)) / 1000
      // );
    }
    return timeLeft;
    // console.log(timeLeft);
  }
  return (
    <div className="flex w-max my-auto items-center justify-between gap-x-1 ">
      <span>{timeLeft?.days}d</span>
      <span>:</span>
      <span>{timeLeft?.hours}h</span>
      <span>:</span>
      <span>{timeLeft?.minutes}m</span>
    </div>
  );
};

export default CountdownTimer;
