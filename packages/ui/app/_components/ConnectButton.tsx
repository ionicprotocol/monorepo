import React, { useEffect } from 'react';

type ConnectButtonProps = JSX.IntrinsicElements['w3m-button'];

export default function ConnectButton(props: ConnectButtonProps) {
  useEffect(() => {
    const connectButtonCSSOvverides = document.createElement('style');

    connectButtonCSSOvverides.innerHTML = `
      :root {
        --wui-color-inverse-100: #0a0a0aff;
      }
    `;

    document.body.appendChild(connectButtonCSSOvverides);

    return () => {
      document.body.removeChild(connectButtonCSSOvverides);
    };
  }, []);

  return <w3m-button {...props} />;
}
