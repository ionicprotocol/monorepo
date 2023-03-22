import type {
  AlertDescriptionProps,
  AlertIconProps,
  AlertProps,
  AlertTitleProps,
} from '@chakra-ui/alert';
import { Alert, AlertDescription, AlertIcon } from '@chakra-ui/alert';
import type { TextProps } from '@chakra-ui/react';
import { AlertTitle, Box, Link, Stack, Text } from '@chakra-ui/react';
import React from 'react';

export const Banner = ({
  title,
  descriptions,
  alertProps,
  alertIconProps,
  alertTitleProps,
  alertDescriptionProps,
}: {
  alertDescriptionProps?: AlertDescriptionProps;
  alertIconProps?: AlertIconProps;
  alertProps?: AlertProps;
  alertTitleProps?: AlertTitleProps;
  descriptions: { text: string; textProps?: TextProps; url?: string }[];
  title?: string;
}) => {
  return (
    <Alert borderRadius={8} status="warning" variant="subtle" {...alertProps}>
      <AlertIcon {...alertIconProps} />
      <Box>
        {title && (
          <AlertTitle fontSize={20} mb={2} {...alertTitleProps}>
            {title}
          </AlertTitle>
        )}
        <AlertDescription fontSize="md" {...alertDescriptionProps}>
          <Stack display="inline-block">
            {descriptions.map((desc, i) =>
              desc.url ? (
                <Text display="inline" key={i} {...desc.textProps}>
                  <Link fontWeight="bold" href={desc.url ? desc.url : undefined} isExternal>
                    {desc.text}
                  </Link>
                </Text>
              ) : (
                <Text display="inline" key={i} {...desc.textProps}>
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
