import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { HStack } from '@chakra-ui/react';

import { CIconButton } from '@ui/components/shared/Button';

export const ExpanderArrow = ({
  getToggleExpandedHandler,
  isExpanded,
  canExpand,
}: {
  canExpand: boolean;
  getToggleExpandedHandler: () => void;
  isExpanded: boolean;
}) => {
  return (
    <HStack justifyContent="center">
      <CIconButton
        alignSelf="flex-end"
        aria-label="detail View"
        borderRadius="50%"
        disabled={!canExpand ? true : false}
        icon={!isExpanded ? <ChevronDownIcon fontSize={30} /> : <ChevronUpIcon fontSize={30} />}
        onClick={(e) => {
          e.stopPropagation();
          getToggleExpandedHandler();
        }}
        variant="_outline"
      />
    </HStack>
  );
};
