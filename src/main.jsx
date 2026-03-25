import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Spinner from './views/spinner/Spinner';
import './utils/i18n';
import { CustomizerContextProvider } from './context/CustomizerContext';
import { Provider } from 'react-redux';
import { store, persistor } from './store/authStore'
import AuthWrapper from './wrappers/authWrapper';
import { PersistGate } from 'redux-persist/integration/react';

async function deferRender() {
  // const { worker } = await import("./api/mocks/browser");
  // return worker.start({
  //   onUnhandledRequest: 'bypass',
  // });
  return Promise.resolve();
}

deferRender().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <CustomizerContextProvider>
      <Suspense fallback={<Spinner />}>
        <Provider store={store}>
          <PersistGate loading={<Spinner />} persistor={persistor}>
            <AuthWrapper>
              <App />
            </AuthWrapper>
          </PersistGate>
        </Provider>
      </Suspense>
    </CustomizerContextProvider>,
  )
})
