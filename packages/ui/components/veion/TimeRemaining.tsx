import React from 'react';

import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes
} from 'date-fns';

const TimeRemaining = ({ lockExpiryDate }: { lockExpiryDate: string }) => {
  const calculateTimeRemaining = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);

    const totalDays = differenceInDays(expiry, now);
    const remainingHours = differenceInHours(expiry, now) % 24;
    const remainingMinutes = differenceInMinutes(expiry, now) % 60;

    return {
      days: Math.max(0, totalDays),
      hours: Math.max(0, remainingHours),
      minutes: Math.max(0, remainingMinutes)
    };
  };

  const { days, hours, minutes } = calculateTimeRemaining(lockExpiryDate);

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs font-semibold text-white/80">
        {lockExpiryDate}
      </div>
      <div className="text-xs font-light text-white/60">
        {`${days}d : ${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m`}
      </div>
    </div>
  );
};

export default TimeRemaining;
