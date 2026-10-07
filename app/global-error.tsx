"use client";

import { Geist, Oswald } from "next/font/google";
import { useEffect } from "react";
import { StatusScreen } from "@/components/site/StatusScreen";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["500", "600", "700"] });

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <html lang="en" className={`${geist.variable} ${oswald.variable} dark`}>
    <body>
      <title>Something went wrong | Basement Performance Products</title>
      <StatusScreen
        code={error.digest ? `Error ${error.digest}` : "Error"}
        title="We hit a snag."
        body="The site could not be loaded. Try again in a moment."
        secondary={<button className="flex min-h-12 cursor-pointer items-center justify-center border border-brand px-6 text-[10px] font-black tracking-[.08em] text-brand uppercase" type="button" onClick={() => retry()}>Try again</button>}
      />
    </body>
  </html>;
}
