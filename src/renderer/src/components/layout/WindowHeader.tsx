import { useAppDispatch, useAppSelector } from '@renderer/models/store';
import {
  moveTab,
  openConfigTab,
  removeTab,
  switchTab,
  WindowTab,
  WindowTabGroup,
} from '@renderer/models/entities/window_tab_group';
import classNames from 'classnames';
import { useCallback } from 'react';
import { ReactClickEvent, ReactMouseEvent } from '@renderer/models/types';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';

const Tab: React.FC<{
  tabGroup: WindowTabGroup;
  tab: WindowTab;
  onClick?: (id: number) => void;
  onMiddleClick?: (id: number) => void;
}> = ({ tabGroup, tab, onClick, onMiddleClick }) => {
  const { setNodeRef, attributes, listeners, transform, transition } = useSortable({
    id: tab.id,
  });

  const handleMouseDown = useCallback(
    (ev: ReactMouseEvent) => {
      if (ev.buttons === 4 || ev.button === 1) {
        onMiddleClick?.(tab.id);
      } else if (ev.button === 0) {
        onClick?.(tab.id);
      }
    },
    [onMiddleClick, tab, onClick],
  );

  const handleClose = useCallback(
    (ev: ReactClickEvent) => {
      ev.stopPropagation();
      onMiddleClick?.(tab.id);
    },
    [onMiddleClick, tab],
  );

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      className={classNames({ windowheadertab: true, active: tabGroup.activeId === tab.id })}
      onMouseDown={handleMouseDown}
      style={style}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
    >
      <div className="title">{tab.title}</div>
      <button className="close" onClick={handleClose}>
        ✕
      </button>
    </div>
  );
};

function WindowHeader(): React.JSX.Element {
  const dispatch = useAppDispatch();

  const tabGroup = useAppSelector((state) => state.windowTabGroup);

  const handleTabClick = useCallback(
    (id: number) => {
      dispatch(switchTab({ id }));
    },
    [dispatch],
  );

  const handleTabClose = useCallback(
    (id: number) => {
      dispatch(removeTab({ id }));
    },
    [dispatch],
  );

  const handleClose = (): Promise<void> => window.mainWindow.close();

  const handleConfig = useCallback(() => {
    dispatch(openConfigTab());
  }, [dispatch]);

  const handleDragEnd = useCallback(
    (ev: DragEndEvent) => {
      if (ev.over?.id === ev.active.id) return;
      if (typeof ev.active.id !== 'number' || typeof ev.over?.id !== 'number') return;

      dispatch(moveTab({ id: ev.active.id as number, overId: ev.over?.id as number }));
    },
    [dispatch],
  );

  return (
    <div id="windowheader">
      <div id="windowheader__tabs">
        <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToHorizontalAxis]}>
          <SortableContext items={tabGroup.tabs}>
            {tabGroup.tabs.map((tab) => (
              <Tab
                key={tab.id}
                data-id={tab.id}
                tab={tab}
                tabGroup={tabGroup}
                onClick={handleTabClick}
                onMiddleClick={handleTabClose}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <div id="windowheader__buttons">
        <button onClick={handleConfig}>設</button>
        <button onClick={handleClose}>終</button>
      </div>
    </div>
  );
}

export default WindowHeader;
