import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL || ''

const client = postgres(connectionString, {
  prepare: false, // Required for Supavisor transaction pooler
  max: process.env.NODE_ENV === 'production' ? 2 : 5,
  idle_timeout: 20,
  connect_timeout: 10,
})

export const db = drizzle(client, { schema })
export { schema }
