"use client";

import { useEffect } from "react";

export default function JourneyPage() {
  useEffect(() => {
    import("./journeyApp").then((mod) => mod.default());
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to your journey
      </a>
      <div id="app">
        <p className="loading">Opening your journey…</p>
      </div>
      <dialog id="dialog" aria-labelledby="dialog-title"></dialog>
      <div id="toast" role="status" aria-live="polite"></div>
    </>
  );
}
