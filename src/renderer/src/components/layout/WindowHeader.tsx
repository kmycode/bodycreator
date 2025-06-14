import { useAppDispatch, useAppSelector } from '@renderer/models/store';
import { removeTab, switchTab, WindowTab, WindowTabGroup } from '@renderer/models/entities/window_tab_group';
import classNames from 'classnames';
import { useCallback } from 'react';
import { ReactClickEvent, ReactMouseEvent } from '@renderer/models/types';

const Tab: React.FC<{
  tabGroup: WindowTabGroup;
  tab: WindowTab;
  onClick?: (id: number) => void;
  onMiddleClick?: (id: number) => void;
}> = ({ tabGroup, tab, onClick, onMiddleClick }) => {
  const handleClick = useCallback(() => {
    if (!tab.id || !onClick) return;

    onClick(tab.id);
  }, [tab, onClick]);

  const handleMouseDown = useCallback(
    (ev: ReactMouseEvent) => {
      if (ev.buttons === 4 || ev.button === 1) {
        onMiddleClick?.(tab.id);
      }
    },
    [onMiddleClick, tab],
  );

  const handleClose = useCallback(
    (ev: ReactClickEvent) => {
      ev.stopPropagation();
      onMiddleClick?.(tab.id);
    },
    [onMiddleClick, tab],
  );

  return (
    <div
      className={classNames({ windowheadertab: true, active: tabGroup.activeId === tab.id })}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
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

  return (
    <div id="windowheader">
      <div id="windowheader__tabs">
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
      </div>
      <div id="windowheader__buttons">
        <button onClick={handleClose}>終</button>
      </div>
    </div>
  );
}

export default WindowHeader;
