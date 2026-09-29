"use client";

import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

type Preview = { key: string; file: File; url: string };

export function ImageUploadPreview({ name, label, multiple = false, required = false, maxFiles }: { name: string; label: string; multiple?: boolean; required?: boolean; maxFiles?: number }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewsRef = useRef<Preview[]>([]);
  const [previews, setPreviews] = useState<Preview[]>([]);

  useEffect(() => () => previewsRef.current.forEach((preview) => URL.revokeObjectURL(preview.url)), []);

  const commitFiles = (next: Preview[]) => {
    const transfer = new DataTransfer();
    next.forEach((preview) => transfer.items.add(preview.file));
    if (inputRef.current) {
      inputRef.current.files = transfer.files;
      inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    }
    previewsRef.current = next;
    setPreviews(next);
  };

  const selectFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const incoming = Array.from(files).map((file) => ({
      key: `${file.name}-${file.size}-${file.lastModified}`,
      file,
      url: URL.createObjectURL(file),
    }));
    const next = multiple
      ? [...previewsRef.current, ...incoming].filter((preview, index, items) => items.findIndex((item) => item.key === preview.key) === index)
      : incoming.slice(0, 1);
    if (!multiple) previewsRef.current.forEach((preview) => URL.revokeObjectURL(preview.url));
    commitFiles(maxFiles ? next.slice(0, maxFiles) : next);
  };

  const remove = (key: string) => {
    const removed = previewsRef.current.find((preview) => preview.key === key);
    if (removed) URL.revokeObjectURL(removed.url);
    commitFiles(previewsRef.current.filter((preview) => preview.key !== key));
  };

  return <div className="flex flex-col gap-3">
    <span className="text-[9px] font-black tracking-[.08em] text-foreground/65 uppercase">{label}</span>
    <input ref={inputRef} className="sr-only" id={inputId} accept="image/*" multiple={multiple} name={name} required={required} type="file" onChange={(event) => selectFiles(event.currentTarget.files)} />
    <label className="flex min-h-12 w-fit cursor-pointer items-center gap-3 border border-foreground/18 bg-ink px-4 text-[9px] font-black uppercase transition hover:border-brand hover:text-brand" htmlFor={inputId}><ImagePlus size={17} />{multiple ? "Select images" : "Select image"}</label>
    {previews.length > 0 && <div className={`grid gap-3 ${multiple ? "grid-cols-4 max-[800px]:grid-cols-3 max-[520px]:grid-cols-2" : "max-w-72 grid-cols-1"}`}>{previews.map((preview) => <article className="relative aspect-[4/3] overflow-hidden border border-foreground/15 bg-ink" key={preview.key}><Image className="object-cover" src={preview.url} alt={`Selected file ${preview.file.name}`} fill unoptimized sizes="240px" /><button className="absolute top-2 left-2 grid size-8 cursor-pointer place-items-center rounded-full border border-white/25 bg-black/75 text-white backdrop-blur transition hover:border-brand hover:text-brand" type="button" onClick={() => remove(preview.key)} aria-label={`Remove ${preview.file.name}`}><X size={15} /></button><span className="absolute right-2 bottom-2 left-2 truncate bg-black/65 px-2 py-1 text-[8px] text-white">{preview.file.name}</span></article>)}</div>}
    <p className="text-[9px] leading-4 text-foreground/40">The selected files remain only in this browser preview until you save.{maxFiles ? ` You can select up to ${maxFiles}.` : ""}</p>
  </div>;
}
