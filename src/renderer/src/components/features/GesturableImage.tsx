import { useSpring, animated } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { useCallback, useEffect, useState } from "react";

const GesturableImage: React.FC<{
  dragVersion?: number;
  fileName: string;
}> = ({ dragVersion, fileName, }) => {
  const [baseX, setBaseX] = useState(0);
  const [baseY, setBaseY] = useState(0);
  const [baseScale, setBaseScale] = useState(1);

  const [style, springRef] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
  }));

  const bind = useGesture({
    onDrag: (ev) => {
      const [x, y] = ev.offset;

      void springRef.start({ x: x + baseX, y: y + baseY, });
    },

    onPinch: (ev) => {
      const [s] = ev.offset;

      void springRef.start({ scale: s, });
    },

    onWheel: (ev) => {
      const [, s] = ev.offset;
      const scale = (1 + (-s / 1024)) * baseScale;
      const minScale = 0.1;

      void springRef.start({ scale: Math.max(minScale, scale), });
    },
  });

  const handleReset = useCallback(() => {
    const x = springRef.current[0].springs.x.get();
    setBaseX(baseX - x);

    const y = springRef.current[0].springs.y.get();
    setBaseY(baseY - y);

    const s = springRef.current[0].springs.scale.get();
    setBaseScale(1 / s * baseScale);

    springRef.set({ x: 0, y: 0, scale: 0 });
  }, [setBaseX, baseX, setBaseY, baseY, setBaseScale, baseScale]);

  useEffect(() => {
    if (!dragVersion) return;

    handleReset();
  }, [dragVersion, fileName]);

  return (
    <div className="gesturable-image">
      <div className="canvas" {...bind()}>
        <animated.img src={fileName}
                      style={style}
                      draggable={false}
                      />
      </div>
    </div>
  )
};

export default GesturableImage;
