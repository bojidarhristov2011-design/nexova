import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'
import { cookies } from 'next/headers'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await db.user.findUnique({ where: { email: credentials.email } })
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name ?? null }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      const realId = token.id as string
      if (session.user) (session.user as { id?: string }).id = realId

      // If this user is "acting as" another account they've been granted access to, swap in.
      try {
        const jar = await cookies()
        const actingAs = jar.get('nx_acting_as')?.value
        if (actingAs && session.user?.email) {
          const grant = await db.teamAccess.findFirst({
            where: {
              ownerId: actingAs,
              OR: [{ collaboratorId: realId }, { collaboratorEmail: session.user.email }],
            },
          })
          if (grant) {
            const owner = await db.user.findUnique({ where: { id: actingAs }, select: { id: true, email: true, name: true } })
            if (owner) {
              session.user.id = owner.id
              session.user.email = owner.email
              session.user.name = owner.name
              ;(session.user as { actingAs?: boolean; realId?: string }).actingAs = true
              ;(session.user as { actingAs?: boolean; realId?: string }).realId = realId
            }
          }
        }
      } catch {
        // cookies() unavailable in this context — just return the normal session
      }

      return session
    },
  },
}
