import { InfoOutlineIcon } from '@chakra-ui/icons';
import { HStack, SystemProps, Text, TextProps } from '@chakra-ui/react';

import { Column } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMaybeResponsiveProp } from '@ui/hooks/useMaybeResponsiveProp';
import { CaptionedStatProps } from '@ui/types/ComponentPropsType';

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
    <Column mainAxisAlignment="center" crossAxisAlignment={crossAxisAlignment} gap={2}>
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
    <Text variant="tnumber" size="sm" fontWeight="bold">
      {text}
    </Text>
  );
};

const SecondStat = ({ text }: { text: string }) => {
  return (
    <Text variant="tnumber" size="sm" fontWeight="bold" opacity={0.6}>
      {'/'} {text}
    </Text>
  );
};

const Caption = ({ textAlign, children, ...restOfProps }: TextProps) => {
  return (
    <Text
      textTransform="capitalize"
      letterSpacing="wide"
      size="sm"
      textAlign={textAlign}
      {...restOfProps}
    >
      {children}
    </Text>
  );
};

export default CaptionedStat;
