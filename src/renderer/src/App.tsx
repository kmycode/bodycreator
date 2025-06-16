import { useEffect } from 'react';
import AppLogo from './components/generic/AppLogo';
import { ModalRoot } from './components/layout/ModalRoot';
import WindowHeader from './components/layout/WindowHeader';
import { WindowTabContainer } from './components/layout/WindowTabContainer';
import { setCurrentDirectory, setInitialLoadStatus } from './models/entities/app_system';
import { store, useAppDispatch, useAppSelector } from './models/store';
import { loadDatabase } from './models/utils/databaseinitializer';
import { FileDropReceiver } from './components/layout/FileDropReceiver';
import { createImageByBuffer } from './models/utils/imageserializer';

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

  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent): void => {
      const activeTabId = store.getState().windowTabGroup.activeId;
      const activeTab = store.getState().windowTabGroup.tabs.find((t) => t.id === activeTabId);

      if (ev.ctrlKey && ev.key === 'v' && activeTab?.type === 'image-list') {
        (async () => {
          const clipboardContents = await navigator.clipboard.read();
          for (const item of clipboardContents) {
            if (item.types.includes('image/png')) {
              const blob = await item.getType('image/png');
              const buffer = await blob.arrayBuffer();
              await createImageByBuffer(dispatch, 'png', buffer);
            }
          }
        })();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

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
      <FileDropReceiver />
    </div>
  );
}

export default App;
