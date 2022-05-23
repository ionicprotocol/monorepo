import { Heading, SystemProps, Text, TextProps } from '@chakra-ui/react';

import { useColors } from '@ui/hooks/useColors';
import { useMaybeResponsiveProp } from '@ui/hooks/useMaybeResponsiveProp';
import { CaptionedStatProps } from '@ui/types/ComponentPropsType';
import { Column } from '@ui/utils/chakraUtils';

const CaptionedStat = ({
  stat,
  caption,
  captionSize,
  spacing,
  statSize,
  crossAxisAlignment,
  captionFirst,
  captionColor,
}: CaptionedStatProps) => {
  const crossAxisAlignmentStatic = useMaybeResponsiveProp(crossAxisAlignment);
  const textAlign = crossAxisAlignmentStatic.replace('flex-', '') as SystemProps['textAlign'];

  const { cCard } = useColors();

  return (
    <Column mainAxisAlignment="center" crossAxisAlignment={crossAxisAlignment}>
      {captionFirst ?? true ? (
        <>
          <Caption
            size={captionSize}
            mt={spacing ?? 0}
            textAlign={textAlign}
            color={captionColor ?? cCard.txtColor}
          >
            {caption}
          </Caption>
          <Stat size={statSize} text={stat} />
        </>
      ) : (
        <>
          <Stat size={statSize} text={stat} />
          <Caption
            size={captionSize}
            mt={spacing ?? 0}
            textAlign={textAlign}
            color={captionColor ?? cCard.txtColor}
          >
            {caption}
          </Caption>
        </>
      )}
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
