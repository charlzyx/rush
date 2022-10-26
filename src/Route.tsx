import React, { createContext, useCallback, useContext, useState } from 'react';

interface Route {
  now: RouteKey;
  is: (page: RouteKey) => boolean;
  to: (page: RouteKey) => void;
}

interface RouteMap {
  '/': '/';
  zip: 'zip';
  history: 'history';
  up: 'up';
  settings: 'settings';
  about: 'about';
}

type RouteKey = keyof RouteMap;

const RouteContext = createContext<Route>({
  now: '/',
  is: (page: string) => false,
  to: (page: string) => {},
});

export const RouteProvider = (props: React.PropsWithChildren<{}>) => {
  const [now, setNow] = useState<RouteKey>('/');

  const is = useCallback(
    (x: RouteKey) => {
      return now === x;
    },
    [now],
  );
  const to = useCallback((x: RouteKey) => {
    setNow(x);
  }, []);

  return (
    <RouteContext.Provider
      value={{
        now,
        is,
        to,
      }}
    >
      {props.children}
    </RouteContext.Provider>
  );
};

export const useRoute = () => {
  const ctx = useContext(RouteContext);
  return ctx;
};

export const KeepPage = (props: React.PropsWithChildren<{ show: boolean }>) => {
  return (
    <div
      style={{
        height: '100%',
        position: props.show ? undefined : 'fixed',
        // transform: `translate3d(${props.show ? 0 : '200%'}, 0, 0)`,
        right: props.show ? 0 : '200%',
        opacity: props.show ? 1 : 0,
        transition: 'all ease 0.123s',
      }}
    >
      {props.children}
    </div>
  );
};
