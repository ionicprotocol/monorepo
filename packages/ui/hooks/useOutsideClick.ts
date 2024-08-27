import { useEffect, useRef, useState } from 'react';

export const useOutsideClick = () => {
  const componentRef = useRef(null!);
  const [isopen, setIsOpen] = useState<boolean>(false);
  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const handleOutsideClick = (e: any) => {
    //@ts-ignore
    if (componentRef.current && !componentRef.current?.contains(e?.target)) {
      setIsOpen(false);
    }
  };

  const toggle = () => setIsOpen((prevState) => !prevState);
  return { componentRef, isopen, toggle };
};
