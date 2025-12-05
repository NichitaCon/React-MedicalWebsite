import { createContext, useState } from "react";

export const HeaderContext = createContext();

export function HeaderProvider({ children }) {
  const [headerContent, setHeaderContent] = useState(null);

  return (
    <HeaderContext.Provider value={{ headerContent, setHeaderContent }}>
      {children}
    </HeaderContext.Provider>
  );
}
