"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";

type BaseProps = {
  placeholder: string;
  sendLabel: string;
  disabled?: boolean;
};

type ClientComposerProps = BaseProps & {
  mode?: "client";
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void | Promise<void>;
  sending?: boolean;
};

type ServerComposerProps = BaseProps & {
  mode: "server";
  formAction: (formData: FormData) => void | Promise<void>;
  hiddenFields: Record<string, string>;
  inputName?: string;
};

const barClass =
  "flex w-full items-center gap-2 rounded-md border border-foreground/10 bg-ink px-3 py-1.5 shadow-inner shadow-black/20";
const inputClass =
  "quote-chat-scroll block max-h-32 min-h-5 min-w-0 flex-1 resize-none border-0 bg-transparent p-0 text-sm normal-case leading-5 outline-none placeholder:text-foreground/40";
const buttonClass =
  "grid size-10 shrink-0 cursor-pointer place-items-center rounded-md bg-brand text-black transition hover:bg-[#d99f00] disabled:cursor-not-allowed disabled:opacity-40";

function QuoteChatComposerServer({
  formAction,
  hiddenFields,
  inputName = "body",
  placeholder,
  sendLabel,
  disabled,
}: ServerComposerProps) {
  const inFlightRef = useRef(false);
  const [pending, setPending] = useState(false);
  const busy = disabled || pending;

  const handleAction = async (formData: FormData) => {
    if (inFlightRef.current || disabled) return;
    const body = String(formData.get(inputName) ?? "").trim();
    if (!body) return;
    inFlightRef.current = true;
    setPending(true);
    try {
      await formAction(formData);
    } finally {
      inFlightRef.current = false;
      setPending(false);
    }
  };

  return (
    <form action={handleAction} className="w-full">
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} name={name} type="hidden" value={value} />
      ))}
      <div className={barClass}>
        <textarea
          className={inputClass}
          name={inputName}
          placeholder={placeholder}
          rows={1}
          required
          disabled={busy}
        />
        <button className={buttonClass} type="submit" aria-label={sendLabel} disabled={busy}>
          <Send size={18} />
        </button>
      </div>
    </form>
  );
}

function QuoteChatComposerClient({
  value,
  onChange,
  onSubmit,
  sending,
  placeholder,
  sendLabel,
  disabled,
}: ClientComposerProps) {
  const inFlightRef = useRef(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inFlightRef.current || sending || disabled || !value.trim()) return;
    inFlightRef.current = true;
    try {
      await onSubmit(event);
    } finally {
      inFlightRef.current = false;
    }
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className={barClass}>
        <textarea
          className={inputClass}
          placeholder={placeholder}
          rows={1}
          value={value}
          disabled={disabled || sending}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (inFlightRef.current || sending || disabled || !value.trim()) return;
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button
          className={buttonClass}
          type="submit"
          disabled={disabled || sending || !value.trim()}
          aria-label={sendLabel}
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
}

export function QuoteChatComposer(props: ClientComposerProps | ServerComposerProps) {
  if (props.mode === "server") {
    return <QuoteChatComposerServer {...props} />;
  }
  return <QuoteChatComposerClient {...props} />;
}
