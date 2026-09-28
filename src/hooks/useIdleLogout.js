// src/hooks/useIdleLogout.js
import { useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

const EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

export function useIdleLogout({ timeout = 4 * 60 * 1000, onIdle } = {}) {
  const timerRef = useRef(null);

  useEffect(() => {
    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        try {
          await signOut(auth);
          onIdle?.();
        } catch (e) {
          console.warn("Авто-чиқишда хатолик:", e);
        }
      }, timeout);
    };

    reset();

    EVENTS.forEach((ev) =>
      window.addEventListener(ev, reset, { passive: true })
    );
    // сбрасываем таймер, если юзер вернулся во вкладку
    window.addEventListener("focus", reset);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      EVENTS.forEach((ev) => window.removeEventListener(ev, reset));
      window.removeEventListener("focus", reset);
    };
  }, [timeout, onIdle]);
}