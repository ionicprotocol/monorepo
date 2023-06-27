import { InfoOutlineIcon } from '@chakra-ui/icons';
import type { SystemProps, TextProps } from '@chakra-ui/react';
import { HStack, Text } from '@chakra-ui/react';

import { Column } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMaybeResponsiveProp } from '@ui/hooks/useMaybeResponsiveProp';
import type { CaptionedStatProps } from '@ui/types/ComponentPropsType';

const CaptionedStat = ({
  stat,
  secondStat,
  caption,
  spacing,
  crossAxisAlignment,
  tooltip,
}: CaptionedStatProps) => {
  const crossAxisAlignmentStatic = useMaybeResponsiveProp(crossAxisAlignment);
  const textAlign = crossAxisAlignmentStatic.replace('flex-', '') as SystemProps['textAlign'];

  return (
    <Column crossAxisAlignment={crossAxisAlignment} gap={2} mainAxisAlignment="center">
      <HStack>
        <Caption mt={spacing ?? 0} textAlign={textAlign}>
          {caption}
        </Caption>
        {tooltip && (
          <SimpleTooltip label={tooltip}>
            <Text fontWeight="bold">
              <InfoOutlineIcon />
            </Text>
          </SimpleTooltip>
        )}
      </HStack>
      <HStack>
        <Stat text={stat} />
        {secondStat && <SecondStat text={secondStat} />}
      </HStack>
    </Column>
  );
};

const Stat = ({ text }: { text: string }) => {
  return (
    <Text fontWeight="bold" size="sm" variant="tnumber">
      {text}
    </Text>
  );
};

const SecondStat = ({ text }: { text: string }) => {
  return (
    <Text fontWeight="bold" opacity={0.6} size="sm" variant="tnumber">
      {'/'} {text}
    </Text>
  );
};

export const Caption = ({ textAlign, children, ...restOfProps }: TextProps) => {
  return (
    <Text
      letterSpacing="wide"
      size="sm"
      textAlign={textAlign}
      textTransform="capitalize"
      {...restOfProps}
    >
      {children}
    </Text>
  );
};

export default CaptionedStat;
