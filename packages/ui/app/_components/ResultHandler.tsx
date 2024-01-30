import React from 'react';
import { ThreeCircles } from 'react-loader-spinner';

type ResultHandlerProps = {
  children: React.ReactNode;
  isLoading: boolean;
  isFetching?: boolean;
  width?: string;
  height?: string;
  color?: string;
  center?: boolean;
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
        visible={true}
        height={height}
        width={width}
        color={color}
        wrapperStyle={{
          width: `${width}px`,
          height: `${height}px`,
          margin: center ? 'auto' : '0px'
        }}
        ariaLabel="three-circles-loading"
      />
    );
  }

  return <>{children}</>;
}
