import type { Metadata } from "next";
import dynamic from "next/dynamic";

const LighthouseView = dynamic(() =>
  import("@/modules/lighthouse/LighthouseView").then((m) => ({ default: m.LighthouseView }))
);

export const metadata: Metadata = {
  title: "Lighthouse",
};

export default function LighthousePage() {
  return <LighthouseView />;
}
