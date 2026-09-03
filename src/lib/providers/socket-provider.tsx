'use client';

import { createContext, useContext } from 'react';

type SocketContextType = {
  socket: any | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SocketContext.Provider value={{ socket: null, isConnected: false }}>
      {children}
    </SocketContext.Provider>
  );
};
