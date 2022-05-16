import { Heading, ResponsiveValue, Text } from '@chakra-ui/react';
import * as CSS from 'csstype';

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
  const textAlign = crossAxisAlignmentStatic.replace(
    'flex-',
    ''
  ) as ResponsiveValue<CSS.Property.TextAlign>;

  const { cCard } = useColors();

  return (
    <Column mainAxisAlignment="center" crossAxisAlignment={crossAxisAlignment}>
      {captionFirst ?? true ? (
        <>
          <Caption
            size={captionSize}
            spacing={spacing ?? 0}
            textAlign={textAlign}
            text={caption}
            color={captionColor ?? cCard.txtColor}
          />
          <Stat size={statSize} text={stat} />
        </>
      ) : (
        <>
          <Stat size={statSize} text={stat} />
          <Caption
            size={captionSize}
            spacing={spacing ?? 0}
            textAlign={textAlign}
            text={caption}
            color={captionColor ?? cCard.txtColor}
          />
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

const Caption = ({
  size,
  textAlign,
  spacing,
  text,
  color = '#858585',
}: {
  size: { md: string; xs: string } | string;
  textAlign: ResponsiveValue<CSS.Property.TextAlign> | undefined;
  spacing: string | number;
  text: string;
  color?: string;
}) => {
  return (
    <Text
      textTransform="uppercase"
      letterSpacing="wide"
      color={color}
      fontSize={size}
      textAlign={textAlign}
      mt={spacing ?? 0}
    >
      {text}
    </Text>
  );
};

export default CaptionedStat;
