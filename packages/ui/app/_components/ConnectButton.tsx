import React from 'react';

type ConnectButtonProps = JSX.IntrinsicElements['w3m-button'];

export default function ConnectButton(props: ConnectButtonProps) {
  return <w3m-button {...props} />;
}
