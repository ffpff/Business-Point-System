import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./db"
import bcrypt from "bcryptjs"
import { z } from "zod"
import type { Adapter } from "next-auth/adapters"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const validatedFields = loginSchema.safeParse(credentials)
        if (!validatedFields.success) {
          return null
        }

        const { email, password } = validatedFields.data

        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user || !user.hashedPassword) {
          return null
        }

        const passwordsMatch = await bcrypt.compare(password, user.hashedPassword)

        if (!passwordsMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          image: user.image || undefined,
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        const userWithExtra = user as typeof user & {
          subscriptionType?: string
          usageLimit?: number
          dailyUsageCount?: number
          monthlyUsageCount?: number
        }
        token.subscriptionType = userWithExtra.subscriptionType
        token.usageLimit = userWithExtra.usageLimit
        token.dailyUsageCount = userWithExtra.dailyUsageCount
        token.monthlyUsageCount = userWithExtra.monthlyUsageCount
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.subscriptionType = token.subscriptionType as string
        session.user.usageLimit = token.usageLimit as number
        session.user.dailyUsageCount = token.dailyUsageCount as number
        session.user.monthlyUsageCount = token.monthlyUsageCount as number
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })
          
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || profile?.name || "",
                image: user.image || (profile as { picture?: string })?.picture || "",
                subscriptionType: "free",
                usageLimit: 50,
                dailyUsageCount: 0,
                monthlyUsageCount: 0,
              }
            })
          } else {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                lastActiveAt: new Date(),
              }
            })
          }
        } catch (error) {
          console.error("Error handling Google sign-in:", error)
          return false
        }
      }
      return true
    },
  },
  events: {
    async signIn({ user }) {
      if (user.email) {
        await prisma.user.update({
          where: { email: user.email },
          data: {
            lastActiveAt: new Date(),
          }
        })
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
}