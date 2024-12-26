import { useState, useRef, useLayoutEffect } from 'react';

const AnimateHeight = ({ children }: { children: React.ReactNode }) => {
  const [height, setHeight] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (contentRef.current) {
          setHeight(contentRef.current.scrollHeight);
        }
      });

      resizeObserver.observe(contentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <div
      className="transition-[height] duration-300 ease-in-out overflow-hidden"
      style={{ height: height ? `${height}px` : 'auto' }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
};

export default AnimateHeight;
