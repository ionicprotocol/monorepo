import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { IconButton } from '@chakra-ui/react';
import * as React from 'react';

import { useColors } from '@ui/hooks/useColors';

export const ExpanderButton = ({
  getToggleExpandedHandler,
  isExpanded,
  canExpand,
}: {
  getToggleExpandedHandler: () => void;
  isExpanded: boolean;
  canExpand: boolean;
}) => {
  const { cOutlineBtn } = useColors();

  return (
    <IconButton
      alignSelf="flex-end"
      onClick={(e) => {
        e.stopPropagation();
        getToggleExpandedHandler();
      }}
      disabled={!canExpand ? true : false}
      variant="outline"
      color={isExpanded ? cOutlineBtn.primary.hoverTxtColor : cOutlineBtn.primary.txtColor}
      aria-label="detail view"
      borderRadius="50%"
      borderWidth={3}
      borderColor={cOutlineBtn.primary.borderColor}
      background={isExpanded ? cOutlineBtn.primary.hoverBgColor : cOutlineBtn.primary.bgColor}
      icon={isExpanded ? <ChevronUpIcon fontSize={30} /> : <ChevronDownIcon fontSize={30} />}
      _hover={{
        background: cOutlineBtn.primary.hoverBgColor,
        color: cOutlineBtn.primary.hoverTxtColor,
      }}
    />
  );
};
