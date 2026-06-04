import type { Metadata } from "next";
import { LighthouseView } from "@/modules/lighthouse/LighthouseView";

export const metadata: Metadata = {
  title: "Lighthouse",
};

export default function LighthousePage() {
  return <LighthouseView />;
}
