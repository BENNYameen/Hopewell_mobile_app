import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type WebSidebarContextValue = {
  open: boolean;
  close: () => void;
  openSidebar: () => void;
  toggle: () => void;
};

const WebSidebarContext = createContext<WebSidebarContextValue | null>(null);

export function WebSidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  const openSidebar = useCallback(() => setOpen(true), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  const value = useMemo(
    () => ({ open, close, openSidebar, toggle }),
    [open, close, openSidebar, toggle],
  );

  return (
    <WebSidebarContext.Provider value={value}>
      {children}
    </WebSidebarContext.Provider>
  );
}

export function useWebSidebar() {
  const ctx = useContext(WebSidebarContext);
  if (!ctx) {
    throw new Error("useWebSidebar must be used within WebSidebarProvider");
  }
  return ctx;
}

/** Safe outside `WebSidebarProvider` (returns null on native). */
export function useWebSidebarState() {
  return useContext(WebSidebarContext);
}
