import type { Metadata } from "next";
import dynamic from "next/dynamic";

const RewardPointsView = dynamic(() =>
  import("@/modules/store/rewards/RewardPointsView").then((m) => ({ default: m.RewardPointsView }))
);
export const metadata: Metadata = { title: "Reward Points — Store" };
export default function RewardsPage() { return <RewardPointsView />; }
