"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AuthModal } from "./AuthModal";

interface AuthModalApi {
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalApi>({
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

/**
 * Глобальный доступ к модалке входа: любой клиентский компонент
 * (голосование, комментарии, шапка) может открыть её вместо редиректа.
 */
export function AuthModalProvider({
  children,
  telegramBot,
}: {
  children: ReactNode;
  telegramBot?: string;
}) {
  const [open, setOpen] = useState(false);
  const openAuthModal = useCallback(() => setOpen(true), []);
  const closeAuthModal = useCallback(() => setOpen(false), []);
  const api = useMemo(
    () => ({ openAuthModal, closeAuthModal }),
    [openAuthModal, closeAuthModal]
  );

  return (
    <AuthModalContext.Provider value={api}>
      {children}
      {open && <AuthModal onClose={closeAuthModal} telegramBot={telegramBot} />}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalApi {
  return useContext(AuthModalContext);
}
