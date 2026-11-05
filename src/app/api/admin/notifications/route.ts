import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Notification } from "@/models";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const query: Record<string, unknown> = {};
    if (unreadOnly) query.isRead = false;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
    ]);

    return NextResponse.json({ success: true, notifications, total, page, limit });
  } catch (error) {
    console.error("GET /api/admin/notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    if (body.markAllRead) {
      await Notification.updateMany({}, { $set: { isRead: true, readAt: new Date() } });
    } else if (body.id) {
      await Notification.findByIdAndUpdate(body.id, {
        $set: { isRead: body.isRead ?? true, readAt: body.isRead ? new Date() : undefined },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/admin/notifications error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    if (body.deleteReadAll) {
      await Notification.deleteMany({ isRead: true });
    } else if (body.id) {
      await Notification.findByIdAndDelete(body.id);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/notifications error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
