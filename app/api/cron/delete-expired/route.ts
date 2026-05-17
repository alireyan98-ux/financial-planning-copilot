import { NextRequest, NextResponse } from "next/server";
import { runExpiredCaseDeletion, sendDeletionWarnings } from "@/lib/deletion";

export const runtime = "nodejs"; // needs crypto module

export async function GET(req: NextRequest) {
  try {
    const [deletionReport, warningCount] = await Promise.all([
      runExpiredCaseDeletion(),
      sendDeletionWarnings(),
    ]);

    return NextResponse.json({
      success: true,
      deletedCases: deletionReport.deletedCount,
      failedDeletions: deletionReport.failedCount,
      warningsSent: warningCount,
      runAt: deletionReport.runAt,
      errors: deletionReport.errors.length > 0 ? deletionReport.errors : undefined,
    });
  } catch (err) {
    console.error("[CRON DELETE-EXPIRED]", err instanceof Error ? err.message : "Unknown");
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
