"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

const storageKey = "basement-pwa-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppHint() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (window.localStorage.getItem(storageKey) === "1") return;

    setHidden(false);

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (hidden) return null;

  const dismiss = () => {
    window.localStorage.setItem(storageKey, "1");
    setHidden(true);
  };

  const install = async () => {
    if (!deferred) {
      dismiss();
      return;
    }
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  };

  return (
    <div className="flex flex-col gap-3 border border-brand/35 bg-brand/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-[10px] font-black tracking-[.12em] text-brand uppercase">Install Basement app</p>
        <p className="text-xs leading-5 text-foreground/60">
          Add to your home screen for quick access to shipping quotes, orders, and account tools.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          className="flex min-h-10 cursor-pointer items-center gap-2 bg-brand px-4 text-[9px] font-black text-black uppercase"
          type="button"
          onClick={() => void install()}
        >
          <Download size={14} />
          Install
        </button>
        <button
          className="grid size-10 cursor-pointer place-items-center text-foreground/45 transition hover:text-brand"
          type="button"
          aria-label="Dismiss install hint"
          onClick={dismiss}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
