import { ComponentWithAs, Text, useClipboard, useToast } from '@chakra-ui/react';
import { ReactNode, useCallback, useEffect } from 'react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';

const ClipboardValue = ({
  value = '',
  label,
  component: Component = Text,
  ...props
}: {
  value: string;
  label?: string;
  // eslint-disable-next-line @ui/typesscript-eslint/no-explicit-any
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
  const toast = useToast({ position: 'top' });

  useEffect(() => {
    if (hasCopied) {
      toast({
        title: 'Copied to clipboard',
      });
    }
  }, [hasCopied, toast]);

  return (
    <SimpleTooltip label={value}>
      <Component cursor="pointer" onClick={onClick} {...props}>
        {label ? label : value}
      </Component>
    </SimpleTooltip>
  );
};

export default ClipboardValue;
