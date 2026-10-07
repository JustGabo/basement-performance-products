"use client";

import { useEffect } from "react";
import { StatusScreen } from "@/components/site/StatusScreen";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <StatusScreen
    code={error.digest ? `Error ${error.digest}` : "Error"}
    title="We hit a snag."
    body="This page could not be loaded. Try again, or head back to the shop."
    secondary={<button className="flex min-h-12 cursor-pointer items-center justify-center border border-brand px-6 text-[10px] font-black tracking-[.08em] text-brand uppercase" type="button" onClick={() => retry()}>Try again</button>}
  />;
}
