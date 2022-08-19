export const joinIfArray = (value: string | string[] | undefined, separator = ''): string => {
  if (!value) return '';

  if (Array.isArray(value)) return value.join(separator);

  return value;
};
