import { Flex } from '@chakra-ui/react';
import React from 'react';

import type { CenterProps, ColumnProps, RowProps } from '@ui/types/ComponentPropsType';

const Center = ({ children, expand, ...others }: CenterProps) => {
  if (expand) {
    others.height = '100%';
    others.width = '100%';
  }

  return (
    <Flex alignItems="center" justifyContent="center" {...others}>
      {children}
    </Flex>
  );
};

const Column = ({
  mainAxisAlignment = 'flex-start',
  crossAxisAlignment = 'center',
  children,
  expand,
  ...others
}: ColumnProps) => {
  if (expand) {
    others.height = '100%';
    others.width = '100%';
  }

  return (
    <Flex
      alignItems={crossAxisAlignment}
      flexDirection="column"
      justifyContent={mainAxisAlignment}
      {...others}
    >
      {children}
    </Flex>
  );
};

const Row = ({
  mainAxisAlignment = 'flex-start',
  crossAxisAlignment = 'center',
  children,
  expand,
  ...others
}: RowProps) => {
  if (expand) {
    others.height = '100%';
    others.width = '100%';
  }

  return (
    <Flex
      alignItems={crossAxisAlignment}
      flexDirection="row"
      justifyContent={mainAxisAlignment}
      {...others}
    >
      {children}
    </Flex>
  );
};

const RowOrColumn = ({
  mainAxisAlignment = 'flex-start',
  crossAxisAlignment = 'center',
  children,
  expand,
  isRow,
  ...others
}: RowProps & { isRow: boolean }) => {
  if (expand) {
    others.height = '100%';
    others.width = '100%';
  }

  return (
    <Flex
      alignItems={crossAxisAlignment}
      flexDirection={isRow ? 'row' : 'column'}
      justifyContent={mainAxisAlignment}
      {...others}
    >
      {children}
    </Flex>
  );
};

export { Center, Row, Column, RowOrColumn };
