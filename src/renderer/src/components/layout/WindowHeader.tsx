import { useAppSelector } from "@renderer/models/store";
import { WindowTab, WindowTabGroup } from "@renderer/models/entities/window_tab_group";
import { FunctionComponent } from "react";
import classNames from "classnames";

const Tab: FunctionComponent<{
  tabGroup: WindowTabGroup;
  tab: WindowTab;
}> = ({ tabGroup, tab }) => {
  return (
    <div className={classNames({ 'windowheadertab': true, active: tabGroup.activeId === tab.id })}>
      {tab.title}
    </div>
  );
}

function WindowHeader(): React.JSX.Element {
  const tabGroup = useAppSelector((state) => state.windowTabGroup);

  const handleClose = () => window.mainWindow.close();

  return (
    <div id="windowheader">
      <div id="windowheader__tabs">
        {tabGroup.tabs.map((tab) => (
          <Tab key={tab.id} tab={tab} tabGroup={tabGroup}/>
        ))}
      </div>
      <div id="windowheader__buttons">
        <button onClick={handleClose}>終</button>
      </div>
    </div>
  );
}

export default WindowHeader;
