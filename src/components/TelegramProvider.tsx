"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { TgUser } from "@/lib/types";

type WebAppSdk = typeof import("@twa-dev/sdk").default;

interface TelegramContextValue {
  webApp: WebAppSdk | null;
  user: TgUser | null;
  /** true once SDK init + auth attempt finished (also in plain-browser mode) */
  ready: boolean;
  isTelegram: boolean;
  cloudStorage: boolean;
  haptic: (type?: "light" | "medium" | "success" | "error") => void;
}

const TelegramContext = createContext<TelegramContextValue>({
  webApp: null,
  user: null,
  ready: false,
  isTelegram: false,
  cloudStorage: false,
  haptic: () => {},
});

export const useTelegram = () => useContext(TelegramContext);

const LOCALE_COOKIE = "NEXT_LOCALE";

function pickLocale(languageCode?: string): string {
  if (!languageCode) return "uz";
  if (languageCode.startsWith("uz")) return "uz";
  if (["ru", "kk", "ky", "tg", "be", "uk"].some((l) => languageCode.startsWith(l))) return "ru";
  return "en";
}

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [webApp, setWebApp] = useState<WebAppSdk | null>(null);
  const [user, setUser] = useState<TgUser | null>(null);
  const [ready, setReady] = useState(false);
  const [cloudStorage, setCloudStorage] = useState(false);
  const router = useRouter();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        // @twa-dev/sdk touches `window` on import — load client-side only.
        const WebApp = (await import("@twa-dev/sdk")).default;
        if (!WebApp.initData) {
          setReady(true); // opened in a normal browser → guest mode
          return;
        }

        setWebApp(WebApp);
        WebApp.ready();
        WebApp.expand();
        try {
          WebApp.disableVerticalSwipes();
        } catch {
          /* older clients */
        }

        // Map Telegram theme onto CSS variables.
        const applyTheme = () => {
          const p = WebApp.themeParams;
          const root = document.documentElement;
          const vars: Record<string, string | undefined> = {
            "--tg-bg": p.bg_color,
            "--tg-bg-secondary": p.secondary_bg_color,
            "--tg-text": p.text_color,
            "--tg-hint": p.hint_color,
            "--tg-link": p.link_color,
            "--tg-button": p.button_color,
            "--tg-button-text": p.button_text_color,
          };
          for (const [k, v] of Object.entries(vars)) if (v) root.style.setProperty(k, v);
          root.classList.toggle("tg-dark", WebApp.colorScheme === "dark");
        };
        applyTheme();
        WebApp.onEvent("themeChanged", applyTheme);

        // Locale auto-detection: only on first visit (no cookie yet).
        const tgUser = WebApp.initDataUnsafe?.user;
        if (tgUser && !document.cookie.includes(`${LOCALE_COOKIE}=`)) {
          const locale = pickLocale(tgUser.language_code);
          document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;SameSite=None;Secure`;
          if (locale !== "uz") router.refresh();
        }

        // Server-side initData validation → session cookie + Supabase upsert.
        try {
          const res = await fetch("/api/auth/telegram", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData: WebApp.initData }),
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setCloudStorage(data.storage === "cloud");
          } else if (tgUser) {
            // Auth backend not configured — still show who we are locally.
            setUser({ id: tgUser.id, firstName: tgUser.first_name, username: tgUser.username });
          }
        } catch {
          /* offline — guest mode */
        }
      } catch {
        /* SDK failed to load — guest mode */
      } finally {
        setReady(true);
      }
    })();
  }, [router]);

  const haptic = useCallback(
    (type: "light" | "medium" | "success" | "error" = "light") => {
      try {
        const h = webApp?.HapticFeedback;
        if (!h) return;
        if (type === "success" || type === "error") h.notificationOccurred(type);
        else h.impactOccurred(type);
      } catch {
        /* haptics unsupported */
      }
    },
    [webApp]
  );

  return (
    <TelegramContext.Provider
      value={{ webApp, user, ready, isTelegram: webApp !== null, cloudStorage, haptic }}
    >
      {children}
    </TelegramContext.Provider>
  );
}
