import type { ButtonGroupProps } from '@chakra-ui/react';
import { ButtonGroup, Flex } from '@chakra-ui/react';

import { CButton } from '@ui/components/shared/Button';
import { RowBox } from '@ui/components/shared/IonicBox';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { ADVANCED_MODE, SIMPLE_MODE } from '@ui/constants/index';
import type { LendingModeFilter } from '@ui/types/ComponentPropsType';

export const ModeFilterButtons = ({
  isLoading,
  modeFilter,
  onModeFilter,
  props
}: {
  isLoading: boolean;
  modeFilter: LendingModeFilter;
  onModeFilter: (filter: LendingModeFilter) => void;
  props?: ButtonGroupProps;
}) => {
  return (
    <RowBox borderRadius={{ base: '12px' }} padding={{ base: '4px' }}>
      <ButtonGroup
        flexFlow={'row wrap'}
        gap={0}
        // isAttached
        justifyContent="flex-start"
        spacing={1}
        {...props}
      >
        <CButton
          borderRadius={{ base: '10px' }}
          disabled={isLoading}
          isSelected={modeFilter === SIMPLE_MODE}
          onClick={() => onModeFilter(SIMPLE_MODE)}
          px={{ base: '8px' }}
          py={{ base: 0 }}
          variant="_filter"
        >
          <SimpleTooltip height="100%" label={'Simple Mode'}>
            <Flex alignItems="center" height="100%" justifyContent="center" width="100%">
              Simple Mode
            </Flex>
          </SimpleTooltip>
        </CButton>
        <CButton
          borderRadius={{ base: '10px' }}
          disabled={isLoading}
          isSelected={modeFilter === ADVANCED_MODE}
          onClick={() => onModeFilter(ADVANCED_MODE)}
          px={{ base: '8px' }}
          py={{ base: 0 }}
          variant="_filter"
        >
          <SimpleTooltip height="100%" label={'Advanced Mode'}>
            <Flex alignItems="center" height="100%" justifyContent="center" width="100%">
              Advanced Mode
            </Flex>
          </SimpleTooltip>
        </CButton>
      </ButtonGroup>
    </RowBox>
  );
};
