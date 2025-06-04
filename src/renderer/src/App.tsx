import AppLogo from './components/generic/AppLogo';
import EditPane from './components/layout/EditPane';
import ImageListView from './components/layout/ImageListView';
import SearchPane from './components/layout/SearchPane';
import WindowHeader from './components/layout/WindowHeader';
import { loadDatabase } from './models/utils/databaseinitializer';

function App(): React.JSX.Element {
  loadDatabase();

  return (
    <div id='windowframe'>
      <WindowHeader/>
      <div id='app'>
        <AppLogo/>
        <SearchPane/>
        <ImageListView/>
        <EditPane/>
      </div>
    </div>
  )
}

export default App
