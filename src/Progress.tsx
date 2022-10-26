import React, { createContext, useContext, useState } from 'react';

interface Progress {
  zip: number;
  up: number;
  setZip: (p: number) => void;
  setUp: (p: number) => void;
}

const ProgressContext = createContext<Progress>({
  zip: 0,
  up: 0,
  setZip: () => {},
  setUp: () => {},
});

export const ProgressProvider = (props: React.PropsWithChildren<{}>) => {
  const [zip, setZip] = useState(0);
  const [up, setUp] = useState(0);
  return (
    <ProgressContext.Provider
      value={{
        zip,
        up,
        setUp,
        setZip,
      }}
    >
      {props.children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  return ctx;
};
