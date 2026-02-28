import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const TABLE = 'shared_lists'
const EXPIRY_DAYS = 7

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const supabaseUrl = (process.env.SUPABASE_URL || '').trim()
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  const validUrl = supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')
  if (!validUrl || !supabaseKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Server misconfiguration',
        details: 'SUPABASE_URL must be https://xxxx.supabase.co and SUPABASE_SERVICE_ROLE_KEY must be set in Netlify env.',
      }),
    }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const { id, t, data } = body
  if (!id || !t || !data || !Array.isArray(data.categories)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing id, token, or invalid data.categories' }),
    }
  }

  const tokenHash = hashToken(t)
  const supabase = createClient(supabaseUrl, supabaseKey)

  const now = new Date()
  const newExpiresAt = new Date(now.getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from(TABLE)
    .update({ data, updated_at: now.toISOString(), expires_at: newExpiresAt })
    .eq('id', id)
    .eq('token_hash', tokenHash)

  if (error) {
    console.error(error)
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Share not found or invalid token' }),
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresAt: newExpiresAt }),
  }
}

