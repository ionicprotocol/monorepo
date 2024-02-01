import React from 'react';
import { ThreeCircles } from 'react-loader-spinner';

type ResultHandlerProps = {
  center?: boolean;
  children: React.ReactNode;
  color?: string;
  height?: string;
  isFetching?: boolean;
  isLoading: boolean;
  width?: string;
};

export default function ResultHandler({
  children,
  isLoading,
  isFetching,
  width = '40',
  height = '40',
  color = '#39ff88',
  center = false
}: ResultHandlerProps) {
  if (isLoading || isFetching) {
    return (
      <ThreeCircles
        ariaLabel="three-circles-loading"
        color={color}
        height={height}
        visible={true}
        width={width}
        wrapperStyle={{
          height: `${height}px`,
          margin: center ? 'auto' : '0px',
          width: `${width}px`
        }}
      />
    );
  }

  return <>{children}</>;
}
