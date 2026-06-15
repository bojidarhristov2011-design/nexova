import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'C:/Users/x/nexova/prisma/dev.db' })
const db = new PrismaClient({ adapter })

const result = await db.user.updateMany({
  where: { email: 'bojidarhristov2011@gmail.com' },
  data: { isAdmin: true, plan: 'monthly' },
})
console.log('Updated:', result.count, 'user(s) → isAdmin=true')
await db.$disconnect()
