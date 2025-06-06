import { useSpring, animated } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import { useEffect, useRef } from 'react';

const GesturableImage: React.FC<{
  fileName: string;
}> = ({ fileName }) => {
  const imageWidth = 2480;
  const imageHeight = 3508;

  const [style, springRef] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
  }));

  const bind = useGesture(
    {
      onDrag: ({ offset: [x, y] }) => {
        void springRef.start({ x, y });
      },

      onPinch: ({ offset: [s] }) => {
        void springRef.start({ scale: s });
      },

      onWheel: ({ delta: [, ds] }) => {
        const minScale = 0.05;

        if (ds === 0) return;

        const currentScale = style.scale.get();
        const currentWidth = imageWidth * currentScale;
        const targetWidth = currentWidth + (-ds / 100) * 120;
        const targetScale = targetWidth / imageWidth;

        void springRef.start({ scale: Math.max(minScale, targetScale) });
      },
    },
    {
      drag: {
        from: () => [style.x.get(), style.y.get()],
      },
      wheel: {
        from: () => [0, (1 - style.scale.get()) * 1024],
      },
    },
  );

  /*
  const handleReset = useCallback(() => {
    springRef.set({ x: 0, y: 0, scale: 0 });
  }, [springRef]);
  */

  const canvasRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (canvasRef.current?.parentElement && !isNaN(imageWidth) && !isNaN(imageHeight)) {
      const element = canvasRef.current.parentElement;

      const canvasRect = element.getBoundingClientRect();
      const xScale = Math.min(1, canvasRect.width / imageWidth);
      const yScale = Math.min(1, canvasRect.height / imageHeight);
      const scale = Math.min(xScale, yScale);

      springRef.set({
        scale,
        x: (imageWidth - imageWidth * scale) / -2,
        y: (imageHeight - imageHeight * scale) / -2,
      });
    }
  }, [fileName, canvasRef, springRef, imageWidth, imageHeight]);

  return (
    <div className="gesturable-image" ref={canvasRef}>
      <div className="canvas" {...bind()} style={{ touchAction: 'none' }}>
        <animated.img src={fileName} style={style} draggable={false} width={2480} height={3508} />
      </div>
    </div>
  );
};

export default GesturableImage;
