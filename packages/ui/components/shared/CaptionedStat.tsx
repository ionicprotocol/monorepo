import { QuestionIcon } from '@chakra-ui/icons';
import { Heading, HStack, SystemProps, Text, TextProps } from '@chakra-ui/react';

import { Column } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useColors } from '@ui/hooks/useColors';
import { useMaybeResponsiveProp } from '@ui/hooks/useMaybeResponsiveProp';
import { CaptionedStatProps } from '@ui/types/ComponentPropsType';

const CaptionedStat = ({
  stat,
  caption,
  captionSize,
  spacing,
  statSize,
  crossAxisAlignment,
  captionColor,
  tooltip,
}: CaptionedStatProps) => {
  const crossAxisAlignmentStatic = useMaybeResponsiveProp(crossAxisAlignment);
  const textAlign = crossAxisAlignmentStatic.replace('flex-', '') as SystemProps['textAlign'];

  const { cCard } = useColors();

  return (
    <Column mainAxisAlignment="center" crossAxisAlignment={crossAxisAlignment}>
      <HStack>
        <Caption
          size={captionSize}
          mt={spacing ?? 0}
          textAlign={textAlign}
          color={captionColor ?? cCard.txtColor}
        >
          {caption}
        </Caption>
        {tooltip && (
          <SimpleTooltip label={tooltip}>
            <Text fontWeight="bold">
              <QuestionIcon
                color={cCard.txtColor}
                bg={cCard.bgColor}
                borderRadius={'50%'}
                ml={1}
                mb="4px"
              />
            </Text>
          </SimpleTooltip>
        )}
      </HStack>
      <Stat size={statSize} text={stat} />
    </Column>
  );
};

const Stat = ({ size, text }: { size: { md: string; xs: string } | string; text: string }) => {
  return (
    <Heading fontSize={size} lineHeight="2.5rem">
      {text}
    </Heading>
  );
};

const Caption = ({ size, textAlign, children, color = '#858585', ...restOfProps }: TextProps) => {
  return (
    <Text
      textTransform="uppercase"
      letterSpacing="wide"
      color={color}
      fontSize={size}
      textAlign={textAlign}
      {...restOfProps}
    >
      {children}
    </Text>
  );
};

export default CaptionedStat;
