import NextAuth from "next-auth/next";
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
  ],
  pages: {
    signIn: "/", // Custom sign-in page
    error: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account && account.provider === 'google') {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/login`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ admin_email: user.email })
          });

          const backendData = await response.json();
          if (backendData.success && backendData.data) {
            const { admin_id, name, email, created_at, code_block } = backendData.data;
            user.id = admin_id;
            user.name = name ?? user.name;
            user.email = email ?? user.email;
            user.adminId = admin_id;
            user.createdAt = created_at;
            user.codeBlock = code_block;
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error authenticating with backend:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.adminId = user.adminId;
        token.createdAt = user.createdAt;
        token.codeBlock = user.codeBlock;
      }

      if (trigger === "update" && session?.user) {
        if (session.user.access_token) token.access_token = session.user.access_token;
        if (session.user.refresh_token) token.refresh_token = session.user.refresh_token;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        userId: token.adminId ?? (token.id as string),
        adminId: token.adminId,
        name: token.name,
        email: token.email,
        role: (token.role as string) ?? "admin",
        createdAt: token.createdAt as string,
        codeBlock: token.codeBlock,
      };

      if (token.error) {
        session.error = token.error as string;
      }

      return session;
    }
  }
}

const  handler  = NextAuth(authOptions)
export { handler as GET, handler as POST };
