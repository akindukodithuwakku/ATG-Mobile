import React, { createContext } from "react";
import { LogoutProvider as AutoLogoutProvider } from "../screens/AutoLogout";

export const LogoutContext = createContext({ logout: () => {} });

export function LogoutProvider({ children }) {
  return (
    <AutoLogoutProvider>
      <LogoutContext.Provider value={{ logout: () => {} }}>
        {children}
      </LogoutContext.Provider>
    </AutoLogoutProvider>
  );
}
