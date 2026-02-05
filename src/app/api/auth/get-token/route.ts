import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    // Get the token from the request
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Return only the tokens needed for API calls
    return NextResponse.json({
      access_token: token.access_token,
      refresh_token: token.refresh_token
    });
  } catch (error) {
    console.error("Error getting token:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
