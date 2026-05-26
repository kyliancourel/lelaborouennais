import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email) },
        });

        if (!user) return null;

        const ok = await bcrypt.compare(
          String(credentials.password),
          user.password
        );

        if (!ok) return null;

        return {
          id: user.id,
          email: user.email || "",
          name: user.name || "",
          role: user.role || "USER",
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as {
          id: string;
          email?: string;
          role?: string;
        };
      
        token.id = u.id;
        token.email = u.email ?? "";
        token.role = u.role && u.role.length > 0 ? u.role : "USER";

        console.log("JWT ROLE:", token.role);
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = String(token.role ?? "USER");
        session.user.email = String(token.email ?? "");
      }

      return session;
    },
  },
});