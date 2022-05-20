import { Box, Link, Menu, MenuButton, MenuItem, MenuList, Portal, Text } from '@chakra-ui/react';
import * as RouterLink from 'next/link';
import { useRouter } from 'next/router';
import React, { MouseEventHandler } from 'react';

import { AccountButton } from '@ui/components/shared/AccountButton';
import { Row } from '@ui/utils/chakraUtils';

export const Header = ({
  isAuthed,
  padding,
}: {
  isAuthed: boolean;
  isFuse?: boolean;
  isPool?: boolean;
  padding?: boolean;
}) => {
  return (
    <Row
      color="#FFFFFF"
      px={padding ? 4 : 0}
      height="38px"
      my={4}
      mainAxisAlignment="space-between"
      crossAxisAlignment="center"
      overflowX="visible"
      overflowY="visible"
      width="100%"
    >
      {isAuthed && <p>AUTHED</p>}

      <Row
        mx={4}
        expand
        mainAxisAlignment={{ md: 'space-around', base: 'space-between' }}
        crossAxisAlignment="flex-start"
        overflowX="auto"
        overflowY="hidden"
        transform="translate(0px, 7px)"
      >
        <HeaderLink name=Overview route="/" />
        <HeaderLink ml={4} name=Fuse route="/" />

        <Box ml={4}>
          <Menu autoSelect={false} placement="bottom">
            <MenuButton>
              <SubMenuText text=Governance />
            </MenuButton>

            <Portal>
              <MenuList color="#FFF" minWidth="110px">
                <SubMenuItem name=Snapshot link="https://vote.rari.capital/" />
                <SubMenuItem name=Forums link="https://forums.rari.capital/" />
              </MenuList>
            </Portal>
          </Menu>
        </Box>

        <UtilsLink ml={4} isAuthed={isAuthed} />
      </Row>

      <AccountButton />
    </Row>
  );
};

export const UtilsLink = ({ isAuthed, ml }: { isAuthed: boolean; ml?: number | string }) => {
  return (
    <Box ml={ml ?? 0}>
      <Menu autoSelect={false} placement="bottom">
        <MenuButton>
          <SubMenuText text=Utilities parentLink="/utils" />
        </MenuButton>

        <Portal>
          <MenuList color="#FFF" minWidth="110px">
            {isAuthed && <SubMenuItem name=Positions link="/utils/positions" />}

            <SubMenuItem name=Interest Rates link="/utils/interest-rates" />
          </MenuList>
        </Portal>
      </Menu>
    </Box>
  );
};

export const SubMenuText = ({ text, parentLink }: { text: string; parentLink?: string }) => {
  const router = useRouter();

  const isOnThisRoute = parentLink ? router.pathname.includes(parentLink) : false;

  return <Text fontWeight={isOnThisRoute ? 'bold' : 'normal'}>{t(text)}</Text>;
};

export const SubMenuItem = ({ name, link }: { name: string; link: string }) => {
  return (
    <MenuItem _focus={{ bg: '#2b2a2a' }} _hover={{ bg: '#2b2a2a' }}>
      <Box mx="auto">
        <HeaderLink name={name} route={link} />
      </Box>
    </MenuItem>
  );
};

export const HeaderLink = ({
  name,
  route,
  ml,
  onMouseOver,
  onMouseOut,
}: {
  name: string;
  route: string;

  ml?: number | string;
  onMouseOver?: MouseEventHandler<HTMLAnchorElement>;
  onMouseOut?: MouseEventHandler<HTMLAnchorElement>;
}) => {
  const location = useRouter();
  const isExternal = route.startsWith('http');

  const isOnThisRoute =
    location.pathname === route || location.pathname.replace(/\/+$/, '') === route;

  return isExternal ? (
    <Link
      href={route}
      isExternal
      ml={ml ?? 0}
      whiteSpace="nowrap"
      className="no-underline"
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <Text fontWeight={isOnThisRoute ? 'bold' : 'normal'}>{name}</Text>
    </Link>
  ) : (
    <Link
      /* @ts-ignore */
      as={RouterLink}
      to={route}
      ml={ml ?? 0}
      whiteSpace="nowrap"
      className="no-underline"
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <Text fontWeight={isOnThisRoute ? 'bold' : 'normal'}>{name}</Text>
    </Link>
  );
};
