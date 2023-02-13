import { AddIcon } from '@chakra-ui/icons';
import { IconButton, Input, Text } from '@chakra-ui/react';
import { isAddress } from '@ethersproject/address';
import { useState } from 'react';

import { OptionRow } from '@ui/components/pages/Fuse/FusePoolCreatePage/OptionRow';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useColors } from '@ui/hooks/useColors';
import { useErrorToast } from '@ui/hooks/useToast';
import { shortAddress } from '@ui/utils/shortAddress';

export const WhitelistInfo = ({
  value,
  onChange,
  addToWhitelist,
  removeFromWhitelist,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  addToWhitelist: (v: string, onChange: (v: string[]) => void) => Promise<void>;
  removeFromWhitelist: (v: string, onChange: (v: string[]) => void) => Promise<void>;
}) => {
  const [_whitelistInput, _setWhitelistInput] = useState('');

  const errorToast = useErrorToast();
  const { cSolidBtn } = useColors();

  const add = () => {
    if (isAddress(_whitelistInput) && !value.includes(_whitelistInput)) {
      addToWhitelist(_whitelistInput, onChange);
      // value.push(_whitelistInput);
      // onChange(value);
      _setWhitelistInput('');
    } else {
      errorToast({
        description:
          'This is not a valid ethereum address (or you have already entered this address)',
      });
    }
  };

  const remove = (user: string) => {
    removeFromWhitelist(user, onChange);
    // value.splice(value.indexOf(user), 1);
    // onChange(value);
  };

  return (
    <>
      <OptionRow mb={4} my={0}>
        <Input
          onChange={(event) => _setWhitelistInput(event.target.value)}
          placeholder="0x0000000000000000000000000000000000000000"
          type="text"
          value={_whitelistInput}
        />
        <IconButton
          _active={{}}
          _hover={{ bg: cSolidBtn.primary.hoverBgColor, color: cSolidBtn.primary.hoverTxtColor }}
          aria-label="add"
          bg={cSolidBtn.primary.bgColor}
          color={cSolidBtn.primary.txtColor}
          flexShrink={0}
          icon={<AddIcon />}
          ml={2}
          onClick={add}
          width={35}
        />
      </OptionRow>
      {value && value.length > 0 && (
        <Text mb={4} ml={4} width="100%">
          <b>Already added: </b>
          {value.map((user, index, array) => (
            <SimpleTooltip key={user} label={'Click to remove it'} width="auto">
              <Text
                as="span"
                className="underline-on-hover"
                cursor="pointer"
                onClick={() => remove(user)}
                width="fit-content"
              >
                {shortAddress(user, 8, 6)}
                {array.length - 1 === index ? null : <>,&nbsp;</>}
              </Text>
            </SimpleTooltip>
          ))}
        </Text>
      )}
    </>
  );
};
