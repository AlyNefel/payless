import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import EmailLog from "@/models/EmailLog";
import { sendEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const query: Record<string, unknown> = {};
    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { to: { $regex: search, $options: "i" } },
        { toName: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const total = await EmailLog.countDocuments(query);
    const logs = await EmailLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Stats
    const stats = {
      sent: await EmailLog.countDocuments({ status: "sent" }),
      pending: await EmailLog.countDocuments({ status: "pending" }),
      failed: await EmailLog.countDocuments({ status: "failed" }),
      bounced: await EmailLog.countDocuments({ status: "bounced" }),
    };

    return NextResponse.json({
      success: true,
      logs: logs.map((l) => ({
        id: l._id.toString(),
        to: l.to,
        toName: l.toName || l.to,
        subject: l.subject,
        template: l.templateType || "general",
        status: l.status,
        language: l.language || "fr",
        date: l.createdAt ? new Date(l.createdAt).toLocaleString("fr-FR") : "-",
        messageId: l.messageId,
        error: l.error,
        retryCount: l.retryCount || 0,
      })),
      total,
      stats,
    });
  } catch (error) {
    console.error("[API_EMAIL_LOGS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors du chargement des journaux emails" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { logId } = body;

    if (!logId) {
      return NextResponse.json(
        { success: false, error: "Identifiant du journal requis." },
        { status: 400 }
      );
    }

    const log = await EmailLog.findById(logId);
    if (!log) {
      return NextResponse.json(
        { success: false, error: "Journal d'email introuvable." },
        { status: 404 }
      );
    }

    // Attempt retry
    const res = await sendEmail({
      to: log.to,
      toName: log.toName,
      subject: log.subject,
      html: `<p>Renvoi du message : ${log.subject}</p>`,
      templateType: log.templateType,
      language: log.language,
    });

    if (res.success) {
      log.status = "sent";
      log.retryCount = (log.retryCount || 0) + 1;
      log.sentAt = new Date();
      log.messageId = res.messageId;
      log.error = undefined;
      await log.save();

      return NextResponse.json({
        success: true,
        message: "Email renvoyé avec succès.",
      });
    } else {
      log.retryCount = (log.retryCount || 0) + 1;
      log.error = res.error;
      await log.save();

      return NextResponse.json(
        { success: false, error: res.error || "Échec du renvoi." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[API_EMAIL_LOGS_RETRY_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors du renvoi." },
      { status: 500 }
    );
  }
}

