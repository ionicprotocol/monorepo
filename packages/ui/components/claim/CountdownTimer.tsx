'use client';

import { useEffect, useState } from 'react';

import { DROPDOWN } from '@ui/constants/index';

interface ITime {
  days: number;
  hours: number;
  minutes: number;
}
interface IProp {
  dropdownSelectedCampaign: number;
}

const CountdownTimer = ({ dropdownSelectedCampaign }: IProp) => {
  const diffSeason1 = +new Date('2024-08-31T00:00:00+00:00') - +new Date();
  const diffSeason2 = +new Date('2025-02-15T04:20:00+00:00') - +new Date();
  const diffS1presale = +new Date('2024-08-21T00:00:00+00:00') - +new Date();

  // let timeLeft: ITime;

  useEffect(() => {
    if (dropdownSelectedCampaign === DROPDOWN.AirdropSZN1)
      setTimeLeft(calculateTimeLeft(diffSeason1));
    if (dropdownSelectedCampaign === DROPDOWN.AirdropSZN2)
      setTimeLeft(calculateTimeLeft(diffSeason2));
    if (dropdownSelectedCampaign === DROPDOWN.PublicSale)
      setTimeLeft(calculateTimeLeft(diffS1presale));
  }, [diffS1presale, diffSeason1, diffSeason2, dropdownSelectedCampaign]);

  const [timeLeft, setTimeLeft] = useState<ITime>();

  useEffect(() => {
    setTimeout(() => {
      let timeremaining;
      if (dropdownSelectedCampaign === DROPDOWN.AirdropSZN1)
        timeremaining = calculateTimeLeft(diffSeason1);
      if (dropdownSelectedCampaign === DROPDOWN.AirdropSZN2)
        timeremaining = calculateTimeLeft(diffSeason2);
      if (dropdownSelectedCampaign === DROPDOWN.PublicSale)
        timeremaining = calculateTimeLeft(diffS1presale);
      setTimeLeft(timeremaining);
    }, 1000);
  }, [diffS1presale, diffSeason1, diffSeason2, dropdownSelectedCampaign]);

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
    <div className="flex w-max my-auto items-center justify-between gap-x-1">
      <span>{timeLeft?.days}d</span>
      <span>:</span>
      <span>{timeLeft?.hours}h</span>
      <span>:</span>
      <span>{timeLeft?.minutes}m</span>
    </div>
  );
};

export default CountdownTimer;
