import type {
  AlertDescriptionProps,
  AlertIconProps,
  AlertProps,
  AlertTitleProps
} from '@chakra-ui/alert';
import { Alert, AlertDescription, AlertIcon } from '@chakra-ui/alert';
import type { TextProps } from '@chakra-ui/react';
import { AlertTitle, Box, Link, Stack, Text } from '@chakra-ui/react';
import React from 'react';
import { BsExclamationCircle } from 'react-icons/bs';

export const Banner = ({
  title,
  descriptions,
  alertProps,
  alertIconProps,
  alertTitleProps,
  alertDescriptionProps
}: {
  alertDescriptionProps?: AlertDescriptionProps;
  alertIconProps?: AlertIconProps;
  alertProps?: AlertProps;
  alertTitleProps?: AlertTitleProps;
  descriptions: { text: string; textProps?: TextProps; url?: string }[];
  title?: string;
}) => {
  return (
    <Alert variant="ghost" {...alertProps}>
      <AlertIcon as={BsExclamationCircle} {...alertIconProps} />
      <Box>
        {title && (
          <AlertTitle mb={2} {...alertTitleProps}>
            {title}
          </AlertTitle>
        )}
        <AlertDescription {...alertDescriptionProps}>
          <Stack display="inline-block">
            {descriptions.map((desc, i) =>
              desc.url ? (
                <Text display="inline" key={i} variant="inherit" {...desc.textProps}>
                  <Link fontWeight="bold" href={desc.url ? desc.url : undefined} isExternal>
                    {desc.text}
                  </Link>
                </Text>
              ) : (
                <Text display="inline" key={i} variant="inherit" {...desc.textProps}>
                  {desc.text}
                </Text>
              )
            )}
          </Stack>
        </AlertDescription>
      </Box>
    </Alert>
  );
};
