import { Select, SelectProps } from '@chakra-ui/react';

import { useColors } from '@ui/hooks/useColors';

export const LanguageSelect = (extraProps: SelectProps) => {
  const { i18n } = useTranslation();
  const { cSelect } = useColors();
  return (
    <Select
      value={i18n.language}
      onChange={(event) => {
        i18n.changeLanguage(event.target.value);
        localStorage.setItem('rariLang', event.target.value);
      }}
      width="100%"
      {...extraProps}
    >
      <option value="en" style={{ color: cSelect.txtColor }}>
        English
      </option>
      <option value="zh-CN" style={{ color: cSelect.txtColor }}>
        简体中文
      </option>
      <option value="zh-TW" style={{ color: cSelect.txtColor }}>
        中國傳統的
      </option>
    </Select>
  );
};
