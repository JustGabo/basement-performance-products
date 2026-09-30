import type { Metadata } from "next";
import { BuildsIndex } from "@/components/builds/BuildsIndex";
import { getVehicleBuilds } from "@/lib/home-content";

export const metadata: Metadata = {
  title: "Community Builds | Basement Performance Products",
  description: "Explore customer cars and fiberglass modifications built in the Basement community.",
};

export default async function BuildsPage() {
  const builds = await getVehicleBuilds();
  return <BuildsIndex builds={builds} />;
}
