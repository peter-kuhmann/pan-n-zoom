import { useCallback, useRef, useState } from 'react';

type WatchSizeRef = (element: Element | null | undefined) => void;

export default function useWatchSize(): {
  ref: WatchSizeRef;
  width: number;
  height: number;
} {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback<WatchSizeRef>((element) => {
    if (element != null) {
      const resizeObserver = new ResizeObserver(() => {
        const box = element.getBoundingClientRect();
        setWidth(box.width);
        setHeight(box.height);
      });

      resizeObserver.observe(element, { box: 'content-box' });
      resizeObserverRef.current = resizeObserver;
    } else {
      if (resizeObserverRef.current != null) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    }
  }, []);

  return {
    ref,
    width,
    height,
  };
}
