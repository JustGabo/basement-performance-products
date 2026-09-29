import { MapPin } from "lucide-react";
import { getShopifyCustomer } from "@/lib/shopify/customer-data";

export default async function AddressesPage() {
  const customer = await getShopifyCustomer({ orders: 1, addresses: 50 });
  const addresses = customer?.addresses.nodes ?? [];
  return <section className="flex flex-col gap-8"><div className="flex flex-col gap-2"><p className="text-[10px] font-black tracking-[.18em] text-brand uppercase">Delivery details</p><h1 className="font-display text-[clamp(48px,6vw,78px)] leading-[.9] font-bold tracking-[-.035em] uppercase">Addresses</h1><p className="max-w-2xl text-sm leading-6 text-foreground/55">Addresses saved during Shopify checkout are securely attached to your customer account.</p></div>
    {addresses.length ? <div className="grid grid-cols-2 gap-4 max-[650px]:grid-cols-1">{addresses.map((address) => <article className="flex min-h-48 flex-col gap-6 border border-foreground/15 bg-panel p-5" key={address.id}><span className="grid size-10 place-items-center border border-brand/35 text-brand"><MapPin size={19} /></span><div className="flex flex-col gap-1 text-sm"><h2 className="font-display text-2xl font-bold uppercase">{address.name || "Address"}</h2>{address.formatted.map((line) => <span className="text-foreground/55" key={line}>{line}</span>)}{address.phoneNumber && <span className="text-foreground/55">{address.phoneNumber}</span>}</div></article>)}</div> : <div className="flex min-h-64 flex-col items-center justify-center gap-4 border border-dashed border-foreground/20 bg-panel px-6 text-center"><MapPin className="text-brand" size={34} /><h2 className="font-display text-3xl font-bold uppercase">No saved addresses</h2><p className="max-w-md text-sm text-foreground/50">Your address will be saved to Shopify when you complete checkout while signed in.</p></div>}
  </section>;
}
