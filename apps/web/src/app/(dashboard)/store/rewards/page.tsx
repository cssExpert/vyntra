import type { Metadata } from "next";
import { RewardPointsView } from "@/modules/store/rewards/RewardPointsView";
export const metadata: Metadata = { title: "Reward Points — Store" };
export default function RewardsPage() { return <RewardPointsView />; }
