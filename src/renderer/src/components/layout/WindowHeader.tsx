import { useAppDispatch, useAppSelector } from '@renderer/models/store';
import { switchTab, WindowTab, WindowTabGroup } from '@renderer/models/entities/window_tab_group';
import classNames from 'classnames';
import { useCallback } from 'react';

const Tab: React.FC<{
  tabGroup: WindowTabGroup;
  tab: WindowTab;
  onClick?: (id: number) => void;
}> = ({ tabGroup, tab, onClick }) => {
  const handleClick = useCallback(() => {
    if (!tab.id || !onClick) return;

    onClick(tab.id);
  }, [tab, onClick]);

  return (
    <button
      className={classNames({ windowheadertab: true, active: tabGroup.activeId === tab.id })}
      onClick={handleClick}
    >
      {tab.title}
    </button>
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

  const handleClose = (): Promise<void> => window.mainWindow.close();

  return (
    <div id="windowheader">
      <div id="windowheader__tabs">
        {tabGroup.tabs.map((tab) => (
          <Tab key={tab.id} data-id={tab.id} tab={tab} tabGroup={tabGroup} onClick={handleTabClick} />
        ))}
      </div>
      <div id="windowheader__buttons">
        <button onClick={handleClose}>終</button>
      </div>
    </div>
  );
}

export default WindowHeader;
