export const extractAndConvertStringTOValue = (
  input: string
): { value1: number; value2: number } => {
  // Extract the numbers using regex
  const regex = /([\d,]+\.\d+)[^\d]+([\d,]+\.\d+)/;
  const matches = input.match(regex);

  if (!matches || matches.length < 3) {
    throw new Error('The input string does not contain the expected format.');
  }

  // Remove commas and convert to numbers
  const value1 = parseFloat(matches[1].replace(/,/g, ''));
  const value2 = parseFloat(matches[2].replace(/,/g, ''));

  return { value1, value2 };
};
