import { Select, SelectProps } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { useColors } from '@hooks/useColors';

export const LanguageSelect = (extraProps: SelectProps) => {
  const { i18n } = useTranslation();
  const { solidBtnBgColor, textColor } = useColors();
  return (
    <Select
      value={i18n.language}
      onChange={(event) => {
        i18n.changeLanguage(event.target.value);
        localStorage.setItem('rariLang', event.target.value);
      }}
      fontWeight="bold"
      width="100%"
      {...extraProps}
      color="black"
      background={solidBtnBgColor}
    >
      <option value="en" style={{ color: textColor }}>
        English
      </option>
      <option value="zh-CN" style={{ color: textColor }}>
        简体中文
      </option>
      <option value="zh-TW" style={{ color: textColor }}>
        中國傳統的
      </option>
    </Select>
  );
};
