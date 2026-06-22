import { useState } from "react";

const HASH = import.meta.env.VITE_APP_PASSWORD_HASH;
const SESSION_KEY = "khaos.auth.v1";

async function sha256(str) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function isAuthenticated() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === HASH;
  } catch {
    return false;
  }
}

// If no password hash is configured (dev mode), skip the gate entirely.
export function PasswordGate({ children }) {
  const [authed, setAuthed] = useState(() => !HASH || isAuthenticated());
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  if (authed) return children;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim()) return;
    setChecking(true);
    setError(false);
    const hash = await sha256(value);
    if (hash === HASH) {
      try {
        sessionStorage.setItem(SESSION_KEY, HASH);
      } catch {}
      setAuthed(true);
    } else {
      setError(true);
      setValue("");
    }
    setChecking(false);
  }

  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center bg-ink-900 px-4">
      <div className="mb-8 flex flex-col items-center gap-2 select-none">
        <span className="text-5xl text-copper-400 animate-spin-slow">✷</span>
        <span className="font-display text-2xl font-semibold tracking-tight text-ink-100">
          Khaos
        </span>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
        <input
          autoFocus
          type="password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          placeholder="Password"
          className={`w-full rounded-lg border bg-ink-800 px-4 py-3 text-center text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none transition-colors ${
            error
              ? "border-rust-500 focus:border-rust-500"
              : "border-ink-600 focus:border-copper-400"
          }`}
        />
        {error && (
          <p className="text-center text-xs text-rust-500">
            Incorrect password
          </p>
        )}
        <button
          type="submit"
          disabled={checking || !value.trim()}
          className="w-full rounded-lg bg-copper-500 py-3 text-sm font-medium text-ink-900 hover:bg-copper-400 disabled:opacity-40 transition-colors"
        >
          {checking ? "Checking…" : "Enter"}
        </button>
      </form>

      <p className="mt-8 max-w-xs text-center text-xs text-ink-600">
        Set <code className="text-ink-500">VITE_APP_PASSWORD_HASH</code> in your
        .env to enable this gate. Generate a hash with:{" "}
        <code className="text-ink-500">echo -n "yourpassword" | sha256sum</code>
      </p>
    </div>
  );
}
