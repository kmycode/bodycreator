import { useSpring, animated } from '@react-spring/web';
import { updateMatrix } from '@renderer/models/entities/image_preview_matrix';
import { useAppDispatch, useAppSelector } from '@renderer/models/store';
import { useGesture } from '@use-gesture/react';
import classNames from 'classnames';
import { useEffect, useRef } from 'react';

const GesturableImage: React.FC<{
  imageId: number;
}> = ({ imageId }) => {
  const image = useAppSelector((state) => state.imageList.items[imageId])!;
  const { fileName, width: imageWidth, height: imageHeight } = image;
  const currentDirectory = useAppSelector((state) => state.system.currentDirectory);
  const folderName = useAppSelector((state) => state.systemSetting.databaseValues.folderName);

  const {
    scale: firstScale,
    x: firstX,
    y: firstY,
    reverseHorizontal,
    reverseVertical,
    rotate,
  } = useAppSelector((state) => state.imagePreviewMatrixes.matrixes.find((m) => m.imageId === imageId)) ?? {
    imageId,
    x: undefined,
    y: undefined,
    scale: undefined,
    reverseHorizontal: false,
    reverseVertical: false,
    rotate: 0,
  };

  const dispatch = useAppDispatch();

  const [style, springRef] = useSpring(
    () => ({
      x: firstX ?? 0,
      y: firstY ?? 0,
      scale: firstScale ?? 1,
    }),
    [firstScale, firstX, firstY],
  );

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
        const scale = Math.max(minScale, targetScale);

        void springRef.start({ scale });
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
    springRef.set({ x: 0, y: 0, scale: 1 });
  }, [springRef]);
  */

  useEffect(() => {
    return () => {
      const matrix = {
        x: style.x.get(),
        y: style.y.get(),
        scale: style.scale.get(),
        reverseHorizontal,
        reverseVertical,
        rotate,
        imageId,
      };
      dispatch(updateMatrix(matrix));
    };
  }, [imageId, style, dispatch, reverseHorizontal, reverseVertical, rotate]);

  const canvasRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (canvasRef.current?.parentElement && !isNaN(imageWidth) && !isNaN(imageHeight)) {
      if (
        typeof firstX !== 'undefined' &&
        typeof firstY !== 'undefined' &&
        typeof firstScale !== 'undefined'
      ) {
        void springRef.set({
          scale: firstScale,
          x: firstX,
          y: firstY,
        });
        return;
      }

      const element = canvasRef.current.parentElement;

      const canvasRect = element.getBoundingClientRect();
      const xScale = Math.min(1, canvasRect.width / imageWidth);
      const yScale = Math.min(1, canvasRect.height / imageHeight);
      const scale = Math.min(xScale, yScale);

      void springRef.set({
        scale,
        x: (imageWidth - imageWidth * scale) / -2,
        y: (imageHeight - imageHeight * scale) / -2,
      });
    }
  }, [fileName, firstX, firstY, firstScale, canvasRef, springRef, imageWidth, imageHeight]);

  return (
    <div className="gesturable-image">
      <div className="canvas-wrapper">
        <div className="canvas" {...bind()} style={{ touchAction: 'none' }} ref={canvasRef}>
          <animated.div
            style={{ ...style, width: `${imageWidth}px`, height: `${imageHeight}px` }}
            draggable={false}
          >
            <div
              className="canvas-image-rotation-wrapper"
              style={{
                transform: `rotate(${rotate}deg)`,
                width: `${imageWidth}px`,
                height: `${imageHeight}px`,
              }}
            >
              <img
                src={`${currentDirectory}/${folderName}/images/${fileName}`}
                className={classNames({
                  'canvas-image': true,
                  'reverse-horizontal': reverseHorizontal,
                  'reverse-vertical': reverseVertical,
                })}
                width={imageWidth}
                height={imageHeight}
                draggable={false}
              />
            </div>
          </animated.div>
        </div>
      </div>

      <div className="commands-bar"></div>
    </div>
  );
};

export default GesturableImage;
