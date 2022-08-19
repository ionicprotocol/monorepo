import { Heading, Skeleton, Stack, Text } from '@chakra-ui/react';

import { AssetAndOtherInfo } from '@ui/components/pages/Fuse/FusePoolPage/AssetDetails/AssetAndOtherInfo';
import { MidasBox } from '@ui/components/shared/Box';
import { Center, Column } from '@ui/components/shared/Flex';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';

export const AssetDetails = ({ data }: { data: ReturnType<typeof useFusePoolData>['data'] }) => {
  return (
    <MidasBox height={{ base: 'auto', md: '450px' }}>
      {data ? (
        data.assets.length > 0 ? (
          <AssetAndOtherInfo assets={data.assets} />
        ) : (
          <Center height="100%">{'There are no assets in this pool.'}</Center>
        )
      ) : (
        <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start" height="100%" pb={3}>
          <Heading
            size="sm"
            px={4}
            py={5}
            display="flex"
            width="100%"
            justifyContent="space-between"
          >
            <Text>{`Asset Details`}</Text>
            <Skeleton display="inline" w="100px"></Skeleton>
          </Heading>
          <Stack width="100%" height="100%" mx="auto">
            <Skeleton height="50%" />
            <Skeleton height="50%" />
          </Stack>
        </Column>
      )}
    </MidasBox>
  );
};
