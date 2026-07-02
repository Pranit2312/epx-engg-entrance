import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createUser, findUserByEmail, verifyPassword } from "@/lib/data-service"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const existingUser = await findUserByEmail(credentials.email as string)

        if (existingUser) {
          const isCorrectPassword = await verifyPassword(credentials.password as string, existingUser.password)

          if (!isCorrectPassword) {
            throw new Error("Invalid credentials")
          }

          return {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
          }
        }

        const createdUser = await createUser({
          email: credentials.email as string,
          password: credentials.password as string,
          name: (credentials.name as string | undefined) ?? null,
        })

        return {
          id: createdUser.id,
          email: createdUser.email,
          name: createdUser.name,
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key-for-development",
}
