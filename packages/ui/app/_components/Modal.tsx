import Image from 'next/image';
import React, { useEffect, useState } from 'react';

export type ModalProps = {
  children: React.ReactNode;
  close: () => void;
};

export default function Modal({ children, close }: ModalProps) {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  /**
   * Animation
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let closeTimer: ReturnType<typeof setTimeout>;

    if (!isMounted) {
      closeTimer = setTimeout(() => {
        close();
      }, 301);
    }

    return () => {
      clearTimeout(closeTimer);
    };
  }, [close, isMounted]);

  return (
    <div
      className={` z-50 fixed top-0 right-0 w-full h-screen  bg-black/25 flex overflow-y-scroll transition-opacity duration-300 animate-fade-in ${
        isMounted && 'animated'
      }`}
    >
      <div
        className={`w-[85%] max-w-[800px] m-auto relative p-6 bg-grayUnselect rounded-xl scrollbar-hide transition-all duration-300 animate-pop-in ${
          isMounted && 'animated'
        }`}
      >
        <Image
          alt="close"
          className={` h-5 z-10 absolute right-4 top-3 cursor-pointer `}
          height="20"
          onClick={() => setIsMounted(false)}
          src="/img/assets/close.png"
          width="20"
        />

        {children}
      </div>
    </div>
  );
}
