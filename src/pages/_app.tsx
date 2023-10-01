import React, { useEffect, useState } from 'react';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store/store';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Provider store={store}>
      {isClient ? (
        <PersistGate loading={null} persistor={persistor}>
          <main className={inter.className}>
            <Component {...pageProps} />
          </main>
        </PersistGate>
      ) : (
        <main className={inter.className}>
          <Component {...pageProps} />
        </main>
      )}
    </Provider>
  );
}
