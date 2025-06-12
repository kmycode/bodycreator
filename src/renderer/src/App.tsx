import { useEffect } from 'react';
import AppLogo from './components/generic/AppLogo';
import { ModalRoot } from './components/layout/ModalRoot';
//import SearchPane from './components/layout/SearchPane';
import WindowHeader from './components/layout/WindowHeader';
import { WindowTabContainer } from './components/layout/WindowTabContainer';
import { setCurrentDirectory, setInitialLoadStatus } from './models/entities/app_system';
import { useAppDispatch, useAppSelector } from './models/store';
import { loadDatabase } from './models/utils/databaseinitializer';

function App(): React.JSX.Element {
  const loadStatus = useAppSelector((state) => state.system.initialLoadStatus);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (loadStatus === 'notyet') {
      window.file.getCurrentDirectoryFullPath().then((path) => dispatch(setCurrentDirectory({ path })));

      dispatch(setInitialLoadStatus({ status: 'loading' }));
      loadDatabase(dispatch)
        .then(() => {
          dispatch(setInitialLoadStatus({ status: 'loaded' }));
        })
        .catch((err) => {
          console.error(err);
          dispatch(setInitialLoadStatus({ status: 'error' }));
        });
    }
  }, [loadStatus, dispatch]);

  if (loadStatus !== 'loaded') {
    return (
      <div id="app-loading">
        <div>ロード中です。しばらくお待ちください...</div>
      </div>
    );
  }

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
