import React, { createContext } from "react";

export const LogoutContext = createContext({ logout: () => {} });

export function LogoutProvider({ children }) {
  return (
    <LogoutContext.Provider value={{ logout: () => {} }}>
      {children}
    </LogoutContext.Provider>
  );
}
