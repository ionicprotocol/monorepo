import { Heading, Text } from '@chakra-ui/react';

import { useColors } from '@hooks/useColors';
import { useMaybeResponsiveProp } from '@hooks/useMaybeResponsiveProp';
import { Column, CrossAxisAlignment } from '@utils/chakraUtils';

export interface CaptionedStatProps {
  crossAxisAlignment: CrossAxisAlignment;
  stat: string;
  statSize: string;
  caption: string;
  captionSize: string;
  spacing?: string | number;
  captionFirst?: boolean;
  captionColor?: string;
}

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
  const textAlign = crossAxisAlignmentStatic.replace('flex-', '') as any;

  const { cardTextColor } = useColors();

  return (
    <Column mainAxisAlignment="center" crossAxisAlignment={crossAxisAlignment}>
      {captionFirst ?? true ? (
        <>
          <Caption
            size={captionSize}
            spacing={spacing ?? 0}
            textAlign={textAlign}
            text={caption}
            color={captionColor ?? cardTextColor}
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
            color={captionColor ?? cardTextColor}
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

  textAlign: any;

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
