"use client";

import { Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

function snapshot(form: HTMLFormElement) {
  return JSON.stringify(Array.from(new FormData(form).entries()).map(([key, value]) => [
    key,
    value instanceof File ? `${value.name}:${value.size}:${value.lastModified}` : value,
  ]));
}

export function DirtySubmitButton({ editing, label }: { editing: boolean; label: string }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const initialRef = useRef("");
  const [dirty, setDirty] = useState(!editing);
  const { pending } = useFormStatus();

  useEffect(() => {
    const form = buttonRef.current?.closest("form");
    if (!form || !editing) return;
    initialRef.current = snapshot(form);
    const update = () => setDirty(snapshot(form) !== initialRef.current);
    const reset = () => window.setTimeout(update, 0);
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    form.addEventListener("reset", reset);
    return () => {
      form.removeEventListener("input", update);
      form.removeEventListener("change", update);
      form.removeEventListener("reset", reset);
    };
  }, [editing]);

  const disabled = pending || !dirty;
  return <button ref={buttonRef} className="flex min-h-13 items-center gap-3 bg-brand px-7 text-[10px] font-black text-black uppercase transition enabled:cursor-pointer enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:bg-foreground/12 disabled:text-foreground/35" type="submit" disabled={disabled}><Save size={17} />{pending ? "Saving..." : label}</button>;
}
