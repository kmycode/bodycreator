import './assets/main.scss';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './models/store';
import { createImageByBuffer } from './models/utils/imageserializer';
import { IpcRendererEvent } from 'electron';
import { removeCurrentTab, reviveLatestTab } from './models/entities/window_tab_group';

document.ondrop = document.ondragover = (ev: DragEvent) => {
  ev.preventDefault();
  return false;
};

document.onkeydown = (ev: KeyboardEvent) => {
  if (ev.ctrlKey) {
    if (ev.key === 'w') {
      // Ctrl + W
      ev.preventDefault();
      store.dispatch(removeCurrentTab());
    } else if (ev.key === 'T') {
      // Ctrl + shift + W
      ev.preventDefault();
      store.dispatch(reviveLatestTab());
    }
  }
};

window.electron.ipcRenderer.on('image-enqueue', (_: IpcRendererEvent, queue: ImageQueueItem) => {
  console.dir(queue);

  createImageByBuffer(store.dispatch, queue.ext, queue.buffer, {
    memo: queue.title,
    url: queue.url,
    author: queue.author,
  });
});

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <StrictMode>
      <App />
    </StrictMode>
  </Provider>,
);
