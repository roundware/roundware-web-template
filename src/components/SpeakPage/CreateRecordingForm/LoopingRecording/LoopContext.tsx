import { createContext, useContext } from "react";
import { useLoop } from "./useLoop";
import { useLoopingRecording } from "./useLoopingRecording";

const LoopContext = createContext<ReturnType<typeof useLoopingRecording>>(
  undefined!
);

export const useLoopContext = () => {
  const context = useContext(LoopContext);
  if (!context) {
    throw new Error("useLoopContext must be used within a LoopProvider");
  }
  return context;
};

const LoopProvider = ({ children }: { children: React.ReactNode }) => {
  const loop = useLoopingRecording();
  return <LoopContext.Provider value={loop}>{children}</LoopContext.Provider>;
};

// with loop context
const withLoopContext = (Component: React.ComponentType<any>) => {
  return (props: any) => (
    <LoopProvider>
      <Component {...props} />
    </LoopProvider>
  );
};

export { LoopProvider, withLoopContext };
