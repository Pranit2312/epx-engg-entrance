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
            role: existingUser.role,
            image: "image" in existingUser ? (existingUser.image as string | null) : null,
          }
        }

        const createdUser = await createUser({
          email: credentials.email as string,
          password: credentials.password as string,
          name: (credentials.name as string | undefined) ?? null,
        })

        if (!createdUser) {
          throw new Error("Authentication service unavailable")
        }

        return {
          id: createdUser.id,
          email: createdUser.email,
          name: createdUser.name,
          role: createdUser.role,
          image: "image" in createdUser ? (createdUser.image as string | null) : null,
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.role = user.role
        token.picture = user.image
      }
      if (trigger === "update" && session) {
        token.name = session.name ?? token.name
        token.picture = session.image ?? token.picture
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string | null | undefined
        session.user.email = token.email as string
        session.user.role = token.role as string
        session.user.image = token.picture as string | null | undefined
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET environment variable is required")
}
