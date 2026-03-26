import NextAuth from "next-auth";
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getUserByEmail, getUserById } from "./db";

export const authOptions: NextAuthOptions = {
  providers: 
  [
    CredentialsProvider(
      {
                name: "Credentials",
                credentials: {
                        identifier: { label: "User ID or Email", type: "text" },
                        password: { label: "Password", type: "password" },
                            },
                async authorize(credentials: any)
                {
                      console.log("🔐 Authorize called with credentials:", credentials);
                      if (!credentials?.identifier || !credentials?.password)
                          {
                          console.log("❌ Missing credentials");
                          return null;
                          }

                      const identifier = String(credentials.identifier).trim();
                      const user = identifier.includes("@")
                        ? await getUserByEmail(identifier)
                        : await getUserById(identifier);

                      console.log("🔍 Retrieved user:", user ? {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        hasPassword: !!user.password,
                        passwordPrefix: user.password ? user.password.substring(0, 10) + "..." : "MISSING"
                      } : "NULL");

                      if (!user)
                        {
                            console.log("❌ User not found");
                            return null;
                        }

                      console.log("🔑 Comparing passwords...");
                      console.log("   - Input password:", credentials.password);
                      console.log("   - Stored hash prefix:", user.password ? user.password.substring(0, 10) + "..." : "MISSING");

                    const passwordMatch = await compare(
                          credentials.password as string,
                          user.password || ""
                        );

                    console.log("🔑 Password match result:", passwordMatch);

                    if (!passwordMatch) {
                          console.log("❌ Password mismatch");
                          return null;
                        }

                    console.log("✅ Authentication successful");
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        department: user.department || "",
                      };
                },
        }
      ),
    ],

    pages: {
      signIn: "/auth/login",
    },

    callbacks:
     {
        jwt: async ({ token, user }: { token: JWT; user?: any }) => {
          if (user) {
            token.role = user.role;
            token.id = user.id;
            token.department = user.department;
          }
          return token;
        },
        session: async ({ session, token }: { session: Session; token: JWT }) => {
          if (session.user) {
            (session.user as any).role = token.role;
            (session.user as any).id = token.id;
            (session.user as any).department = token.department;
          }
          return session;
        },
     },
     
    session: {
      strategy: "jwt" as const,
      maxAge: 24 * 60 * 60,
    },
    
    secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

export async function auth() {
  return getServerSession(authOptions);
}


