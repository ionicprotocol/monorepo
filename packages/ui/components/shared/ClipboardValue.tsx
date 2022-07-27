import { ComponentWithAs, Text, useClipboard } from '@chakra-ui/react';
import { ReactNode, useCallback, useEffect } from 'react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useInfoToast } from '@ui/hooks/useToast';

const ClipboardValue = ({
  value = '',
  label,
  component: Component = Text,
  ...props
}: {
  value: string;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: ComponentWithAs<any>;
  [key: string]: ReactNode;
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
        title: 'Copied to clipboard',
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
