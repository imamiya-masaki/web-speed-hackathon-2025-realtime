import '@wsh-2025/client/src/setups/polyfills';
import '@wsh-2025/client/src/setups/luxon';
import '@wsh-2025/client/src/setups/unocss';
// import '@unocss/reset/tailwind-compat.css?raw';

import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, HydrationState, RouterProvider } from 'react-router';

import { StoreProvider } from '@wsh-2025/client/src/app/StoreContext';
import { createRoutes } from '@wsh-2025/client/src/app/createRoutes';
import { createStore } from '@wsh-2025/client/src/app/createStore';

// import 'uno.css';
declare global {
  var __zustandHydrationData: unknown;
  var __staticRouterHydrationData: HydrationState;
}


function main() {
  performance.mark('main:start')
  const initialHydration = window.__staticRouterHydrationData;
  console.log('initlaize', performance.now());
  const initialStoreState = (window as any).__initialStoreState || {};
  const store = createStore({hydrationData: initialStoreState});
  console.log('store:start', JSON.stringify(initialStoreState), JSON.stringify(initialHydration))
  console.log('store', performance.now())
  const router = createBrowserRouter(createRoutes(store), {hydrationData: initialHydration});
  performance.mark('router:start')
  console.log('router', performance.now());

  hydrateRoot(
    document.getElementById("root") ?? document,
    <StrictMode>
      <StoreProvider createStore={() => store}>
        <RouterProvider router={router} />
      </StoreProvider>
    </StrictMode>,
  );
}
main();
