import { useColorModeValue } from '@chakra-ui/react';

import { COLOR_PALETTE } from '@ui/theme/index';

export function useColors() {
  const cPage = {
    primary: {
      bgColor: useColorModeValue(COLOR_PALETTE.whiteBg, COLOR_PALETTE.raisinBlack),
      txtColor: useColorModeValue(COLOR_PALETTE.raisinBlack, COLOR_PALETTE.whiteBg),
      borderColor: useColorModeValue(COLOR_PALETTE.ecru, COLOR_PALETTE.ecru),
      dividerColor: useColorModeValue(COLOR_PALETTE.ecru, COLOR_PALETTE.ecru30),
      hoverColor: useColorModeValue(COLOR_PALETTE.silverMetallic30, COLOR_PALETTE.ecru20),
    },
    secondary: {
      bgColor: useColorModeValue(COLOR_PALETTE.ecru, COLOR_PALETTE.ecru),
      txtColor: useColorModeValue(COLOR_PALETTE.raisinBlack, COLOR_PALETTE.raisinBlack),
      borderColor: useColorModeValue(COLOR_PALETTE.ecru, COLOR_PALETTE.ecru),
      dividerColor: useColorModeValue(COLOR_PALETTE.gunmetal80, COLOR_PALETTE.ecru80),
    },
  };

  const cSolidBtn = {
    primary: {
      bgColor: useColorModeValue(COLOR_PALETTE.ecru, COLOR_PALETTE.ecru),
      txtColor: useColorModeValue(COLOR_PALETTE.raisinBlack, COLOR_PALETTE.raisinBlack),
      hoverBgColor: useColorModeValue(COLOR_PALETTE.ecru80, COLOR_PALETTE.ecru80),
      hoverTxtColor: useColorModeValue(COLOR_PALETTE.raisinBlack, COLOR_PALETTE.raisinBlack),
    },
    secondary: {
      bgColor: useColorModeValue(COLOR_PALETTE.silverMetallic, COLOR_PALETTE.silverMetallic),
      txtColor: useColorModeValue(COLOR_PALETTE.raisinBlack, COLOR_PALETTE.raisinBlack),
      hoverBgColor: useColorModeValue(COLOR_PALETTE.bone, COLOR_PALETTE.bone),
      hoverTxtColor: useColorModeValue(COLOR_PALETTE.raisinBlack, COLOR_PALETTE.raisinBlack),
    },
  };

  const cOutlineBtn = {
    primary: {
      bgColor: useColorModeValue(COLOR_PALETTE.whiteBg, COLOR_PALETTE.raisinBlack),
      txtColor: useColorModeValue(COLOR_PALETTE.gunmetal, COLOR_PALETTE.ecru),
      borderColor: useColorModeValue(COLOR_PALETTE.ecru, COLOR_PALETTE.ecru),
      hoverBgColor: useColorModeValue(COLOR_PALETTE.ecru, COLOR_PALETTE.ecru),
      hoverTxtColor: useColorModeValue(COLOR_PALETTE.raisinBlack, COLOR_PALETTE.raisinBlack),
      selectedBgColor: useColorModeValue(COLOR_PALETTE.ecru, COLOR_PALETTE.ecru),
      selectedTxtColor: useColorModeValue(COLOR_PALETTE.raisinBlack, COLOR_PALETTE.raisinBlack),
    },
  };

  const cCard = {
    bgColor: useColorModeValue(COLOR_PALETTE.whiteBg, COLOR_PALETTE.raisinBlack),
    txtColor: useColorModeValue(COLOR_PALETTE.raisinBlack, COLOR_PALETTE.white),
    dividerColor: cPage.primary.dividerColor,
    borderColor: cPage.primary.borderColor,
    hoverBgColor: useColorModeValue(COLOR_PALETTE.silverMetallic20, COLOR_PALETTE.ecru10),
    headingBgColor: useColorModeValue(COLOR_PALETTE.silverMetallic50, COLOR_PALETTE.ecru30),
  };

  const cSwitch = {
    bgColor: useColorModeValue(COLOR_PALETTE.ecru, COLOR_PALETTE.ecru),
  };

  const cSelect = {
    bgColor: useColorModeValue(COLOR_PALETTE.whiteBg, COLOR_PALETTE.raisinBlack),
    txtColor: useColorModeValue(COLOR_PALETTE.gunmetal, COLOR_PALETTE.ecru),
    borderColor: cPage.primary.borderColor,
    hoverBgColor: useColorModeValue(COLOR_PALETTE.silverMetallic30, COLOR_PALETTE.ecru30),
  };

  const cChart = {
    borrowColor: useColorModeValue(COLOR_PALETTE.ecru, COLOR_PALETTE.ecru),
    tokenColor: useColorModeValue(COLOR_PALETTE.bone, COLOR_PALETTE.bone),
    labelBgColor: useColorModeValue(COLOR_PALETTE.ecru, COLOR_PALETTE.ecru),
  };

  const cInput = {
    bgColor: useColorModeValue(COLOR_PALETTE.whiteBg, COLOR_PALETTE.raisinBlack),
    txtColor: useColorModeValue(COLOR_PALETTE.raisinBlack, COLOR_PALETTE.white),
    borderColor: cPage.primary.borderColor,
    placeHolderTxtColor: useColorModeValue(COLOR_PALETTE.silverMetallic, COLOR_PALETTE.white50),
  };

  const cAlert = {
    iconColor: useColorModeValue(COLOR_PALETTE.gunmetal, COLOR_PALETTE.gunmetal),
    bgColor: useColorModeValue(COLOR_PALETTE.ecru, COLOR_PALETTE.ecru),
  };

  const cSlider = {
    thumbBgColor: useColorModeValue(COLOR_PALETTE.raisinBlack, COLOR_PALETTE.raisinBlack),
    thumbBorderColor: useColorModeValue(COLOR_PALETTE.ecru, COLOR_PALETTE.ecru),
    trackBgColor: useColorModeValue(COLOR_PALETTE.bone, COLOR_PALETTE.bone),
    filledTrackBgColor: useColorModeValue(COLOR_PALETTE.ecru, COLOR_PALETTE.ecru),
  };

  const cRadio = {
    bgColor: useColorModeValue(COLOR_PALETTE.ecru, COLOR_PALETTE.ecru),
  };

  return {
    cPage,
    cSolidBtn,
    cAlert,
    cCard,
    cChart,
    cInput,
    cOutlineBtn,
    cSelect,
    cSlider,
    cSwitch,
    cRadio,
  };
}
