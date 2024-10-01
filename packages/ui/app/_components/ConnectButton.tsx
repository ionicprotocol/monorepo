import { type AppKit } from '@reown/appkit';
import { useAppKit } from '@reown/appkit/react';
import React from 'react';

export default function ConnectButton({ modal }: { modal: AppKit }) {
  // TODO
  // const containerRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (containerRef.current) {
  //     const firstChild = containerRef.current.children[0];

  //     if (firstChild.shadowRoot) {
  //       let currentElement = firstChild.shadowRoot;
  //       console.log(containerRef.current.parentNode, currentElement.children);

  //       while (
  //         currentElement.children[0] &&
  //         currentElement.children[0].shadowRoot
  //       ) {
  //         console.log('here');
  //         currentElement = currentElement.children[0].shadowRoot;
  //         // console.log(currentElement.children[0]);

  //         if (currentElement.children[0].tagName === 'BUTTON') {
  //           const styleElement = document.createElement('style');
  //           const buttonCSSOverrides = `
  //             button {
  //               border-radius: 6px !important;
  //             }
  //             button > wui-text {
  //               font-weight: 700;
  //               color: #0a0a0aff !important;
  //               text-transform: uppercase;
  //             }
  //           `;

  //           styleElement.innerHTML = buttonCSSOverrides;

  //           currentElement.appendChild(styleElement);

  //           return () => {
  //             currentElement.removeChild(styleElement);
  //           };
  //         }
  //       }
  //     }
  //   }
  // });

  // const { open } = useAppKit();

  return (
    <button
      className="connect-button"
      // ref={containerRef}
      onClick={() => modal.open()}
    >
      OPEN
    </button>
  );
}
