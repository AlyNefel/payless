import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import EmailTemplate from "@/models/EmailTemplate";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Identifiant de modèle invalide" },
        { status: 400 }
      );
    }

    const template = await EmailTemplate.findById(id).lean();
    if (!template) {
      return NextResponse.json(
        { success: false, error: "Modèle introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error("[API_EMAIL_TEMPLATE_GET_ONE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération du modèle" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Identifiant de modèle invalide" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updated = await EmailTemplate.findByIdAndUpdate(
      id,
      {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.subject !== undefined && { subject: body.subject }),
        ...(body.preheader !== undefined && { preheader: body.preheader }),
        ...(body.htmlBody !== undefined && { htmlBody: body.htmlBody }),
        ...(body.textBody !== undefined && { textBody: body.textBody }),
        ...(body.variables !== undefined && { variables: body.variables }),
        ...(body.customFields !== undefined && { customFields: body.customFields }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Modèle introuvable pour mise à jour" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template: updated,
      message: "Modèle d'email mis à jour avec succès",
    });
  } catch (error) {
    console.error("[API_EMAIL_TEMPLATE_PUT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour du modèle" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Identifiant de modèle invalide" },
        { status: 400 }
      );
    }

    const deleted = await EmailTemplate.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Modèle introuvable pour suppression" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Modèle d'email supprimé avec succès",
    });
  } catch (error) {
    console.error("[API_EMAIL_TEMPLATE_DELETE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression du modèle" },
      { status: 500 }
    );
  }
}

