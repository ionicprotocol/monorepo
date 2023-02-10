import { Divider, Heading, Skeleton } from '@chakra-ui/react';

import { Column } from '@ui/components/shared/Flex';

export const TableSkeleton = ({ tableHeading }: { tableHeading: string }) => (
  <Column
    crossAxisAlignment="flex-start"
    height="100%"
    mainAxisAlignment="flex-start"
    pb={1}
    pt={4}
  >
    <Heading fontSize="22px" fontWeight="normal" px={4} py={3}>
      {tableHeading} <Skeleton display="inline">Loading...</Skeleton>
    </Heading>

    <Divider color="#F4F6F9" />

    <Skeleton h="40" w="100%" />
  </Column>
);
