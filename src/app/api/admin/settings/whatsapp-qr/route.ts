import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET  ?action=status|qr  &instanceId=X  &token=Y  &provider=ultramsg|greenapi
 * Returns the WhatsApp QR code (base64 or URL) or the connection status.
 *
 * We proxy through this route so the admin token never leaves the server.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "status";
  const instanceId = (searchParams.get("instanceId") || "").trim();
  const token = (searchParams.get("token") || "").trim();
  const provider = (searchParams.get("provider") || "ultramsg").trim();

  if (!instanceId || !token) {
    return NextResponse.json(
      { error: "instanceId et token sont requis." },
      { status: 400 }
    );
  }

  try {
    if (provider === "ultramsg") {
      const baseUrl = `https://api.ultramsg.com/${instanceId}`;

      if (action === "qr") {
        // UltraMsg QR endpoint: GET /instance/qr?token=...
        const res = await fetch(
          `${baseUrl}/instance/qr?token=${encodeURIComponent(token)}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          const text = await res.text();
          return NextResponse.json(
            { error: `UltraMsg QR error ${res.status}: ${text}` },
            { status: res.status }
          );
        }
        const data = await res.json();
        // UltraMsg returns { QRCode: "data:image/png;base64,..." } or { qrCode: "..." }
        const qr = data?.QRCode || data?.qrCode || data?.data || null;
        return NextResponse.json({ qrCode: qr });
      } else {
        // Status: GET /instance/status?token=...
        const res = await fetch(
          `${baseUrl}/instance/status?token=${encodeURIComponent(token)}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          return NextResponse.json({ connected: false, status: "error" });
        }
        const data = await res.json();
        const status: string = data?.status || "";
        const connected =
          status === "authenticated" ||
          status === "connected" ||
          data?.accountStatus === "authenticated";
        return NextResponse.json({
          connected,
          phone: data?.phone || data?.number || null,
          status,
        });
      }
    } else if (provider === "greenapi") {
      // GreenAPI state check: GET /waInstance{instanceId}/getStateInstance/{token}
      if (action === "status") {
        const res = await fetch(
          `https://api.green-api.com/waInstance${instanceId}/getStateInstance/${encodeURIComponent(token)}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          return NextResponse.json({ connected: false, status: "error" });
        }
        const data = await res.json();
        const st: string = data?.stateInstance || "";
        return NextResponse.json({
          connected: st === "authorized",
          phone: null,
          status: st,
        });
      } else {
        // GreenAPI QR: GET /waInstance{id}/qr/{token}
        const res = await fetch(
          `https://api.green-api.com/waInstance${instanceId}/qr/${encodeURIComponent(token)}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          return NextResponse.json({ error: `GreenAPI QR error ${res.status}` }, { status: res.status });
        }
        const data = await res.json();
        const qr = data?.message || data?.qrCode || null;
        return NextResponse.json({ qrCode: qr });
      }
    } else {
      return NextResponse.json(
        { error: `Fournisseur '${provider}' non pris en charge pour le QR code.` },
        { status: 400 }
      );
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json(
      { error: `Erreur réseau : ${msg}` },
      { status: 502 }
    );
  }
}

