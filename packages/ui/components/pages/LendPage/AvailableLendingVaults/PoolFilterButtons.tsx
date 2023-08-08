import type { ButtonGroupProps } from '@chakra-ui/react';
import { ButtonGroup, Flex } from '@chakra-ui/react';

import { CButton } from '@ui/components/shared/Button';
import { RowBox } from '@ui/components/shared/IonicBox';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { ALL_POOLS, LST, RWA, STABLECOINS } from '@ui/constants/index';
import type { LendingPoolFilter } from '@ui/types/ComponentPropsType';

export const PoolFilterButtons = ({
  isLoading,
  onPoolFilter,
  poolFilter,
  props
}: {
  isLoading: boolean;
  onPoolFilter: (filter: LendingPoolFilter) => void;
  poolFilter: LendingPoolFilter;
  props?: ButtonGroupProps;
}) => {
  return (
    <RowBox borderRadius={{ base: '12px' }} px={{ base: '4px' }} py={{ base: '2px' }}>
      <ButtonGroup flexFlow={'row wrap'} gap={0} justifyContent="flex-start" spacing={2} {...props}>
        <CButton
          borderRadius={{ base: '10px' }}
          disabled={isLoading}
          isSelected={poolFilter === ALL_POOLS}
          onClick={() => onPoolFilter(ALL_POOLS)}
          px={{ base: '8px' }}
          py={{ base: 0 }}
          variant="_filter"
        >
          <SimpleTooltip height="100%" label={'All Pools'}>
            <Flex alignItems="center" height="100%" justifyContent="center" width="100%">
              All Pools
            </Flex>
          </SimpleTooltip>
        </CButton>
        <CButton
          borderRadius={{ base: '10px' }}
          disabled={isLoading}
          isSelected={poolFilter === LST}
          onClick={() => onPoolFilter(LST)}
          px={{ base: '8px' }}
          py={{ base: 0 }}
          variant="_filter"
        >
          <SimpleTooltip height="100%" label={'LST'}>
            <Flex alignItems="center" height="100%" justifyContent="center" width="100%">
              LST
            </Flex>
          </SimpleTooltip>
        </CButton>
        <CButton
          borderRadius={{ base: '10px' }}
          disabled={isLoading}
          isSelected={poolFilter === RWA}
          onClick={() => onPoolFilter(RWA)}
          px={{ base: '8px' }}
          py={{ base: 0 }}
          variant="_filter"
        >
          <SimpleTooltip height="100%" label={'RWA'}>
            <Flex alignItems="center" height="100%" justifyContent="center" width="100%">
              RWA
            </Flex>
          </SimpleTooltip>
        </CButton>
        <CButton
          borderRadius={{ base: '10px' }}
          disabled={isLoading}
          isSelected={poolFilter === STABLECOINS}
          onClick={() => onPoolFilter(STABLECOINS)}
          px={{ base: '8px' }}
          py={{ base: 0 }}
          variant="_filter"
        >
          <SimpleTooltip height="100%" label={'Stablecoins'}>
            <Flex alignItems="center" height="100%" justifyContent="center" width="100%">
              Stablecoins
            </Flex>
          </SimpleTooltip>
        </CButton>
      </ButtonGroup>
    </RowBox>
  );
};
