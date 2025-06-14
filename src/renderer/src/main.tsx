import './assets/main.scss';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './models/store';

document.ondrop = document.ondragover = (ev: DragEvent) => {
  ev.preventDefault();
  return false;
};

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <StrictMode>
      <App />
    </StrictMode>
  </Provider>,
);
