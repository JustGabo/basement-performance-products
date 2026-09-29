"use client";

import type { ReactElement } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type ServerAction = (formData: FormData) => void | Promise<void>;

export function ConfirmAction({
  action,
  fields,
  title,
  description,
  confirmLabel,
  trigger,
}: {
  action: ServerAction;
  fields: Record<string, string>;
  title: string;
  description: string;
  confirmLabel: string;
  trigger: ReactElement;
}) {
  return <Dialog>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent className="border-foreground/15 bg-panel text-foreground sm:max-w-md">
      <DialogHeader>
        <span className="grid size-11 place-items-center self-center rounded-full border border-red-700/45 bg-red-950/45 text-red-400 sm:self-start"><AlertTriangle size={20} /></span>
        <DialogTitle className="font-display text-3xl font-bold uppercase">{title}</DialogTitle>
        <DialogDescription className="text-sm leading-6 text-foreground/50">{description}</DialogDescription>
      </DialogHeader>
      <form action={action}>{Object.entries(fields).map(([name, value]) => <input name={name} type="hidden" value={value} key={name} />)}<DialogFooter>
        <DialogClose asChild><button className="min-h-11 cursor-pointer border border-foreground/15 px-5 text-[9px] font-black uppercase" type="button">Cancel</button></DialogClose>
        <button className="min-h-11 cursor-pointer bg-red-700 px-5 text-[9px] font-black text-white uppercase transition hover:bg-red-800" type="submit">{confirmLabel}</button>
      </DialogFooter></form>
    </DialogContent>
  </Dialog>;
}
