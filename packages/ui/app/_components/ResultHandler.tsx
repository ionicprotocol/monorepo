import React from 'react';
import { ThreeCircles } from 'react-loader-spinner';

type ResultHandlerProps = {
  children: React.ReactNode;
  isLoading: boolean;
  isFetching?: boolean;
  width?: string;
  height?: string;
  color?: string;
};

export default function ResultHandler({
  children,
  isLoading,
  isFetching,
  width = '40',
  height = '40',
  color = '#39ff88'
}: ResultHandlerProps) {
  if (isLoading || isFetching) {
    return (
      <ThreeCircles
        visible={true}
        height={height}
        width={width}
        color={color}
        ariaLabel="three-circles-loading"
        wrapperClass=""
      />
    );
  }

  return <>{children}</>;
}
