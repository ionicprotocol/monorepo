export const SwitchCSS = ({
  symbol,
  color,
}: {
  symbol: string;
  color: string | undefined | null;
}) => {
  return (
    <style>
      {`  
  .${'switch-' + symbol} > .chakra-switch__track[data-checked] {
    background-color: ${color} !important;
  }
  .${'switch-' + symbol} .chakra-switch__input {
    /* Fixes a bug in the FusePoolPage with the switches creating bottom padding */
    position: static !important;
    height: 0px !important;
    width: 0px !important;
    display: none !important;
  }
  `}
    </style>
  );
};
