import { useColorModeValue } from '@chakra-ui/react';

import { COLOR_PALLETE } from '@constants/color';

export function useColors(): { [key: string]: string } {
  const bgColor = useColorModeValue(COLOR_PALLETE.whiteBg, COLOR_PALLETE.raisinBlack);
  const textColor = useColorModeValue(COLOR_PALLETE.raisinBlack, COLOR_PALLETE.white);

  const subBgColor = useColorModeValue(COLOR_PALLETE.ecru, COLOR_PALLETE.ecru);
  const subTextColor = useColorModeValue(COLOR_PALLETE.raisinBlack, COLOR_PALLETE.raisinBlack);

  const cardBgColor = useColorModeValue(COLOR_PALLETE.raisinBlack, COLOR_PALLETE.raisinBlack);
  const cardTextColor = useColorModeValue(COLOR_PALLETE.white, COLOR_PALLETE.white);
  const cardDividerColor = useColorModeValue(COLOR_PALLETE.whiteBg, COLOR_PALLETE.ecru);
  const cardBorderColor = useColorModeValue(COLOR_PALLETE.raisinBlack, COLOR_PALLETE.ecru);
  const cardHoverBgColor = useColorModeValue(
    COLOR_PALLETE.raisinBlackAlpha,
    COLOR_PALLETE.ecruAlpha
  );

  const borderColor = useColorModeValue(COLOR_PALLETE.silverMetallic, COLOR_PALLETE.ecru);

  const dividerColor = useColorModeValue(COLOR_PALLETE.gunmetal, COLOR_PALLETE.ecru);

  const switchColor = useColorModeValue(COLOR_PALLETE.ecru, COLOR_PALLETE.ecru);

  const solidBtnBgColor = useColorModeValue(COLOR_PALLETE.bone, COLOR_PALLETE.bone);
  const solidBtnTextColor = useColorModeValue(COLOR_PALLETE.raisinBlack, COLOR_PALLETE.raisinBlack);
  const solidBtnHoverBgColor = useColorModeValue(COLOR_PALLETE.ecru, COLOR_PALLETE.ecru);
  const solidBtnActiveBgColor = useColorModeValue(COLOR_PALLETE.ecru, COLOR_PALLETE.ecru);

  const solidSecondBtnBgColor = useColorModeValue(
    COLOR_PALLETE.silverMetallic,
    COLOR_PALLETE.silverMetallic
  );

  const outlineBtnBorderColor = useColorModeValue(COLOR_PALLETE.gunmetal, COLOR_PALLETE.ecru);
  const outlineBtnActiveBorderColor = useColorModeValue(COLOR_PALLETE.ecru, COLOR_PALLETE.ecru);
  const outlineBtnActiveBgColor = useColorModeValue(COLOR_PALLETE.ecru, COLOR_PALLETE.ecru);
  const outlineBtnTextColor = useColorModeValue(COLOR_PALLETE.gunmetal, COLOR_PALLETE.ecru);
  const outlineBtnActiveTextColor = useColorModeValue(
    COLOR_PALLETE.raisinBlack,
    COLOR_PALLETE.raisinBlack
  );

  const selectBgColor = useColorModeValue(COLOR_PALLETE.white, COLOR_PALLETE.raisinBlack);
  const selectTextColor = useColorModeValue(COLOR_PALLETE.gunmetal, COLOR_PALLETE.ecru);

  const borrowLineColor = useColorModeValue(COLOR_PALLETE.ecru, COLOR_PALLETE.ecru);
  const tokenLineColor = useColorModeValue(COLOR_PALLETE.bone, COLOR_PALLETE.bone);
  const labelBgColor = useColorModeValue(COLOR_PALLETE.ecru, COLOR_PALLETE.ecru);

  const rowHoverBgColor = useColorModeValue(
    COLOR_PALLETE.silverMetallicAlpha,
    COLOR_PALLETE.ecruAlpha
  );

  const inputBgColor = useColorModeValue(COLOR_PALLETE.ecru, COLOR_PALLETE.ecru);

  const alertIconColor = useColorModeValue(COLOR_PALLETE.gunmetal, COLOR_PALLETE.gunmetal);

  const rssScoreColor = useColorModeValue(COLOR_PALLETE.ecru, COLOR_PALLETE.ecru);

  const sliderThumbBgColor = useColorModeValue(
    COLOR_PALLETE.raisinBlack,
    COLOR_PALLETE.raisinBlack
  );
  const sliderThumbBorderColor = useColorModeValue(COLOR_PALLETE.ecru, COLOR_PALLETE.ecru);
  const SliderTrackBgColor = useColorModeValue(COLOR_PALLETE.bone, COLOR_PALLETE.bone);
  const SliderFilledTrackBgColor = useColorModeValue(COLOR_PALLETE.ecru, COLOR_PALLETE.ecru);

  return {
    bgColor,
    subBgColor,
    textColor,
    solidBtnActiveBgColor,
    outlineBtnTextColor,
    solidBtnTextColor,
    solidBtnBgColor,
    outlineBtnBorderColor,
    borderColor,
    selectBgColor,
    solidBtnHoverBgColor,
    dividerColor,
    borrowLineColor,
    tokenLineColor,
    labelBgColor,
    subTextColor,
    switchColor,
    rowHoverBgColor,
    inputBgColor,
    solidSecondBtnBgColor,
    alertIconColor,
    rssScoreColor,
    outlineBtnActiveBgColor,
    outlineBtnActiveTextColor,
    outlineBtnActiveBorderColor,
    selectTextColor,
    cardBgColor,
    cardTextColor,
    cardDividerColor,
    cardBorderColor,
    cardHoverBgColor,
    sliderThumbBgColor,
    sliderThumbBorderColor,
    SliderTrackBgColor,
    SliderFilledTrackBgColor,
  };
}
