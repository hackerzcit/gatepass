import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { encode } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const { access_token } = await req.json();

    if (!access_token) {
      return NextResponse.json({ success: false, message: "Access token is required" }, { status: 400 });
    }

    // Get the current token
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    // Update the token with the new access token
    const updatedToken = {
      ...token,
      access_token
    };

    // Encode the updated token
    const encoded = await encode({
      token: updatedToken,
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: 24 * 60 * 60 // 24 hours
    });

    // Set the updated token in a cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: "next-auth.session-token",
      value: encoded,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json({ success: false, message: "Failed to update session" }, { status: 500 });
  }
}
