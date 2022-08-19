import { Divider, Heading, Skeleton } from '@chakra-ui/react';

import { Column } from '@ui/components/shared/Flex';

export const TableSkeleton = ({ tableHeading }: { tableHeading: string }) => (
  <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start" height="100%" pb={1}>
    <Heading size="md" fontWeight="normal" fontSize="18px" px={4} py={3}>
      {tableHeading}: <Skeleton display="inline">Loading</Skeleton>
    </Heading>

    <Divider color="#F4F6F9" />

    <Skeleton w="100%" h="40" />
  </Column>
);
