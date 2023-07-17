import { CheckIcon, CopyIcon } from '@chakra-ui/icons';
import type { ComponentWithAs } from '@chakra-ui/react';
import { Button, Text, useClipboard } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useCallback, useEffect } from 'react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useInfoToast } from '@ui/hooks/useToast';

const ClipboardValue = ({
  value = '',
  label,
  component: Component = Text,
  ...props
}: {
  [key: string]: ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: ComponentWithAs<any>;
  label?: string;
  value: string;
}) => {
  const { hasCopied, onCopy } = useClipboard(value);
  const onClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onCopy();
    },
    [onCopy]
  );
  const infoToast = useInfoToast();

  useEffect(() => {
    if (hasCopied) {
      infoToast({
        id: 'Copied - ' + Math.random().toString(),
        title: 'Copied to clipboard'
      });
    }
  }, [hasCopied, infoToast]);

  return (
    <SimpleTooltip label={value}>
      <Component cursor="pointer" onClick={onClick} {...props}>
        {label ? label : value}
      </Component>
    </SimpleTooltip>
  );
};

export default ClipboardValue;

export const ClipboardValueIconButton = ({
  value = '',
  ...props
}: {
  [key: string]: ReactNode;
  value: string;
}) => {
  const { hasCopied, onCopy } = useClipboard(value);
  const onClick = useCallback(() => {
    onCopy();
  }, [onCopy]);
  const infoToast = useInfoToast();

  useEffect(() => {
    if (hasCopied) {
      infoToast({
        id: 'Copied - ' + Math.random().toString(),
        title: 'Copied to clipboard'
      });
    }
  }, [hasCopied, infoToast]);

  return (
    <Button
      fontSize={18}
      height="auto"
      minW={0}
      mt="-8px !important"
      onClick={onClick}
      p={0}
      variant="_link"
      {...props}
    >
      {hasCopied ? (
        <SimpleTooltip label="Copied">
          <CheckIcon />
        </SimpleTooltip>
      ) : (
        <SimpleTooltip label="Click to copy">
          <CopyIcon />
        </SimpleTooltip>
      )}
    </Button>
  );
};
