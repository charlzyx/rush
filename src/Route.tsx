import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

interface Route {
  now: RouteKey;
  is: (page: RouteKey) => boolean;
  to: (page: RouteKey) => void;
}

interface RouteMap {
  '/': '/';
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
  const style = useMemo((): React.CSSProperties => {
    return props.show
      ? {
          height: '100%',
          transform: `translate3d(0, 0, 0)`,
          opacity: props.show ? 1 : 0,
          transition: 'all ease-in-out 0.2s',
        }
      : {
          position: 'fixed',
          height: '100%',
          transform: `translate3d(200%, 0, 0)`,
          opacity: props.show ? 1 : 0,
          transition: 'all ease-in-out 0.2s',
        };
  }, [props.show]);

  return <div style={style}>{props.children}</div>;
};
