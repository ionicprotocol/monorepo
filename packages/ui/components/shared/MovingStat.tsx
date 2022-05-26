import { useEffect, useMemo, useState } from 'react';
import * as React from 'react';
import { useQuery } from 'react-query';

import CaptionedStat from '@ui/components/shared/CaptionedStat';
import { ABILLY } from '@ui/constants/index';
import {
  APYMovingStatProps,
  APYWithRefreshMovingProps,
  RefetchMovingStatProps,
} from '@ui/types/ComponentPropsType';

export function useInterval(callback: () => void, delay: number) {
  const intervalId = React.useRef<null | number>(null);
  const savedCallback = React.useRef(callback);
  React.useEffect(() => {
    savedCallback.current = callback;
  });
  React.useEffect(() => {
    const tick = () => savedCallback.current();
    if (typeof delay === 'number') {
      intervalId.current = window.setInterval(tick, delay);
      return () => {
        window.clearInterval(intervalId.current || undefined);
      };
    }
  }, [delay]);
  return intervalId.current;
}

export const RefetchMovingStat = React.memo(
  ({ interval, loadingPlaceholder, queryKey, fetch, ...statProps }: RefetchMovingStatProps) => {
    const { data } = useQuery(queryKey, fetch, {
      refetchInterval: interval,
    });

    return <CaptionedStat {...statProps} stat={data ?? loadingPlaceholder} />;
  }
);

export const APYMovingStat = React.memo(
  ({ startingAmount, formatStat, interval, apy, ...statProps }: APYMovingStatProps) => {
    const increasePerInterval = useMemo(() => {
      const percentIncreasePerMillisecond = apy / 365 / 24 / 60 / 60 / 1000;

      const percentIncreasePerInterval = percentIncreasePerMillisecond * interval;

      return percentIncreasePerInterval;
    }, [interval, apy]);

    const [currentStat, setCurrentStat] = useState(startingAmount);

    const formattedStat = useMemo(() => formatStat(currentStat), [formatStat, currentStat]);

    useInterval(() => {
      setCurrentStat((past) => past + past * increasePerInterval);
    }, interval);

    return <CaptionedStat {...statProps} stat={formattedStat} />;
  }
);

export const APYWithRefreshMovingStat = React.memo(
  ({
    queryKey,
    formatStat,
    fetchInterval,
    apyInterval,
    loadingPlaceholder,
    fetch,
    apy,
    ...statProps
  }: APYWithRefreshMovingProps) => {
    const increasePerInterval = useMemo(() => {
      const percentIncreasePerMillisecond = apy / 365 / 24 / 60 / 60 / 1000;

      const percentIncreasePerInterval = percentIncreasePerMillisecond * apyInterval;

      return percentIncreasePerInterval;
    }, [apyInterval, apy]);

    const [currentStat, setCurrentStat] = useState(0);

    const formattedStat = useMemo(() => formatStat(currentStat), [formatStat, currentStat]);

    useInterval(() => {
      setCurrentStat((past) => past + past * increasePerInterval);
    }, apyInterval);

    const { data } = useQuery(queryKey, fetch, {
      refetchInterval: fetchInterval,
    });

    useEffect(() => {
      if (data) {
        setCurrentStat(data);
      }
    }, [data]);

    const celebrate = useMemo(() => currentStat > ABILLY, [currentStat]);

    return (
      <CaptionedStat
        {...statProps}
        stat={!data ? loadingPlaceholder : celebrate ? `${formattedStat}` : formattedStat}
      />
    );
  }
);
