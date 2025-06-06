import AppLogo from './components/generic/AppLogo';
import { ModalRoot } from './components/layout/ModalRoot';
//import SearchPane from './components/layout/SearchPane';
import WindowHeader from './components/layout/WindowHeader';
import { WindowTabContainer } from './components/layout/WindowTabContainer';
import { loadDatabase } from './models/utils/databaseinitializer';

function App(): React.JSX.Element {
  loadDatabase();

  return (
    <div id="windowframe">
      <WindowHeader />
      <div id="app">
        <AppLogo />
        <WindowTabContainer />
      </div>
      <ModalRoot />
    </div>
  );
}

export default App;
