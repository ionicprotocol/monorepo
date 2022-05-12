export const RadioCSS = ({
  symbol,
  color,
}: {
  symbol: string;
  color: string | undefined | null;
}) => {
  return (
    <style>
      {`  
        .${symbol + '-radio'} .chakra-radio__control[data-checked] {
          background-color: ${color ? color : '#282727'} !important;
          border-color: ${color ? color : '#282727'} !important;
          color: ${color ? color : '#282727'} !important;
          box-shadow: none;
        }
        .${symbol + '-radio'} .chakra-radio__control {
          border-color: ${color ? color : '#282727'} !important;
        }
      `}
    </style>
  );
};
