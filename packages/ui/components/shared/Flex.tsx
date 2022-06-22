import { Flex } from '@chakra-ui/react';
import React from 'react';

import { CenterProps, ColumnProps, RowProps } from '@ui/types/ComponentPropsType';

const Center = ({ children, expand, ...others }: CenterProps) => {
  if (expand) {
    others.height = '100%';
    others.width = '100%';
  }

  return (
    <Flex justifyContent="center" alignItems="center" {...others}>
      {children}
    </Flex>
  );
};

const Column = ({
  mainAxisAlignment,
  crossAxisAlignment,
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
      flexDirection="column"
      justifyContent={mainAxisAlignment}
      alignItems={crossAxisAlignment}
      {...others}
    >
      {children}
    </Flex>
  );
};

const Row = ({ mainAxisAlignment, crossAxisAlignment, children, expand, ...others }: RowProps) => {
  if (expand) {
    others.height = '100%';
    others.width = '100%';
  }

  return (
    <Flex
      flexDirection="row"
      justifyContent={mainAxisAlignment}
      alignItems={crossAxisAlignment}
      {...others}
    >
      {children}
    </Flex>
  );
};

const RowOrColumn = ({
  mainAxisAlignment,
  crossAxisAlignment,
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
      flexDirection={isRow ? 'row' : 'column'}
      justifyContent={mainAxisAlignment}
      alignItems={crossAxisAlignment}
      {...others}
    >
      {children}
    </Flex>
  );
};

export { Center, Row, Column, RowOrColumn };
