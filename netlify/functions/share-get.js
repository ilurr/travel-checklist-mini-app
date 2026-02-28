import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const TABLE = 'shared_lists'

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

export async function handler(event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const params = event.queryStringParameters || {}
  const id = params.id
  const t = params.t

  if (!id || !t) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing id or t' }),
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server misconfiguration: missing Supabase env' }),
    }
  }

  const tokenHash = hashToken(t)
  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data: row, error } = await supabase
    .from(TABLE)
    .select('data, expires_at')
    .eq('id', id)
    .eq('token_hash', tokenHash)
    .single()

  if (error || !row) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Share not found or invalid token' }),
    }
  }

  const now = new Date()
  const expiresAt = new Date(row.expires_at)
  if (expiresAt <= now) {
    return {
      statusCode: 410,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'This shared link has expired.' }),
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: row.data, expiresAt: row.expires_at }),
  }
}
