export const ensureSession = async (displayName: string): Promise<boolean> => {
  try {
    const name = displayName?.trim();
    if (!name) {
      return false;
    }

    const storageKey = "battle_session_fp";
    const cookieKey = "battle_session_fp";
    let fingerprint: string | null = null;

    if (typeof window !== "undefined") {
      try {
        fingerprint = window.localStorage.getItem(storageKey);
      } catch (err) {
        console.warn("[ensureSession] Unable to access localStorage", err);
      }

      if (!fingerprint && typeof document !== "undefined") {
        const cookieMatch = document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith(`${cookieKey}=`));
        fingerprint = cookieMatch ? cookieMatch.split("=")[1] : null;
      }

      if (!fingerprint) {
        const random =
          typeof window !== "undefined" &&
          "crypto" in window &&
          window.crypto?.randomUUID
            ? window.crypto.randomUUID()
            : `gen-${Math.random().toString(36).slice(2)}`;
        fingerprint = `fp-${random}`;

        try {
          window.localStorage.setItem(storageKey, fingerprint);
        } catch (err) {
          console.warn(
            "[ensureSession] Failed to persist fingerprint to localStorage",
            err
          );
        }

        if (typeof document !== "undefined") {
          document.cookie = `${cookieKey}=${fingerprint}; path=/; max-age=${
            60 * 60 * 24 * 30
          }`;
        }
      }
    }

    const payload: Record<string, unknown> = { display_name: name };
    if (fingerprint) {
      payload.fingerprint_hash = fingerprint;
    }

    const response = await fetch("/api/battle/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) {
      return false;
    }

    if (typeof window !== "undefined" && fingerprint) {
      try {
        window.localStorage.setItem(storageKey, fingerprint);
      } catch (err) {
        console.warn(
          "[ensureSession] Failed to persist fingerprint after session creation",
          err
        );
      }

      if (typeof document !== "undefined") {
        document.cookie = `${cookieKey}=${fingerprint}; path=/; max-age=${
          60 * 60 * 24 * 30
        }`;
      }
    }

    return true;
  } catch (error) {
    console.error("[ensureSession] Unexpected error", error);
    return false;
  }
};
