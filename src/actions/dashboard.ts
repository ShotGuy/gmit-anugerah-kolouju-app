"use server";

import { getDashboardStats } from "@/lib/cached-data";
import { verifySession } from "@/lib/session.server";

export async function getDashboardStatsAction() {
    await verifySession();
    try {
        const stats = await getDashboardStats();
        return stats;
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        throw new Error("Failed to fetch dashboard stats");
    }
}
