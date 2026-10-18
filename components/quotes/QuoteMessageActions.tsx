"use client";

import { useEffect, useState } from "react";
import { Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type QuoteMessageActionLabels = {
  menu: string;
  edit: string;
  delete: string;
  editTitle: string;
  deleteTitle: string;
  deleteConfirm: string;
  cancel: string;
  apply: string;
  saving: string;
  deleting: string;
};

export function QuoteMessageActions({
  messageId,
  body,
  labels,
  disabled,
  editing,
  deleting,
  menuSide = "left",
  onEdit,
  onDelete,
}: {
  messageId: string;
  body: string;
  labels: QuoteMessageActionLabels;
  disabled?: boolean;
  editing?: boolean;
  deleting?: boolean;
  /** Portal menu opens toward the chat center (avoids clipping in the scroll pane). */
  menuSide?: "top" | "right" | "bottom" | "left";
  onEdit: (messageId: string, nextBody: string) => void | Promise<void>;
  onDelete: (messageId: string) => void | Promise<void>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [draft, setDraft] = useState(body);

  useEffect(() => {
    if (editOpen) setDraft(body);
  }, [body, editOpen]);

  const busy = disabled || editing || deleting;

  const openEdit = () => {
    setMenuOpen(false);
    setDraft(body);
    setEditOpen(true);
  };

  const openDelete = () => {
    setMenuOpen(false);
    setDeleteOpen(true);
  };

  const applyEdit = async () => {
    const next = draft.trim();
    if (!next || next === body.trim()) {
      setEditOpen(false);
      return;
    }
    await onEdit(messageId, next);
    setEditOpen(false);
  };

  const confirmDelete = async () => {
    await onDelete(messageId);
    setDeleteOpen(false);
  };

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-md text-foreground/45 transition hover:bg-foreground/8 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={labels.menu}
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="animate-spin" size={16} aria-hidden />
            ) : (
              <MoreVertical size={16} aria-hidden />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side={menuSide} align="start" collisionPadding={12}>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              openEdit();
            }}
          >
            <Pencil size={15} aria-hidden />
            {labels.edit}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              openDelete();
            }}
          >
            <Trash2 size={15} aria-hidden />
            {labels.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="border-foreground/12 bg-ink text-foreground sm:max-w-md" showCloseButton={!editing}>
          <DialogHeader>
            <DialogTitle>{labels.editTitle}</DialogTitle>
          </DialogHeader>
          <textarea
            className="quote-chat-scroll max-h-48 min-h-24 w-full resize-y rounded-md border border-foreground/15 bg-panel px-3 py-2 text-sm leading-6 outline-none focus:border-brand"
            value={draft}
            disabled={editing}
            onChange={(event) => setDraft(event.target.value)}
            aria-label={labels.editTitle}
          />
          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              className="min-h-11 cursor-pointer border border-foreground/20 px-4 text-[10px] font-black tracking-[.06em] uppercase disabled:opacity-50"
              disabled={editing}
              onClick={() => setEditOpen(false)}
            >
              {labels.cancel}
            </button>
            <button
              type="button"
              className="min-h-11 cursor-pointer bg-brand px-4 text-[10px] font-black tracking-[.06em] text-black uppercase disabled:opacity-50"
              disabled={editing || !draft.trim()}
              onClick={() => void applyEdit()}
            >
              {editing ? labels.saving : labels.apply}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-foreground/12 bg-ink text-foreground sm:max-w-md" showCloseButton={!deleting}>
          <DialogHeader>
            <DialogTitle>{labels.deleteTitle}</DialogTitle>
            <DialogDescription className="text-foreground/55">{labels.deleteConfirm}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              className="min-h-11 cursor-pointer border border-foreground/20 px-4 text-[10px] font-black tracking-[.06em] uppercase disabled:opacity-50"
              disabled={deleting}
              onClick={() => setDeleteOpen(false)}
            >
              {labels.cancel}
            </button>
            <button
              type="button"
              className="min-h-11 cursor-pointer border border-red-500/30 bg-red-500/10 px-4 text-[10px] font-black tracking-[.06em] text-red-400 uppercase transition hover:border-red-500/45 hover:bg-red-500/15 disabled:opacity-50"
              disabled={deleting}
              onClick={() => void confirmDelete()}
            >
              {deleting ? labels.deleting : labels.delete}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
