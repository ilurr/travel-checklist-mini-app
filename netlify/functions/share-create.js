import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const TABLE = 'shared_lists'
const EXPIRY_DAYS = 7

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

function randomToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < length; i++) out += chars.charAt(Math.floor(Math.random() * chars.length))
  return out
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const headers = { 'Content-Type': 'application/json' }

export async function handler(event, context) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
    }

  const url = process.env.URL || process.env.DEPLOY_URL || 'https://example.netlify.app'
  const baseUrl = url.replace(/\/$/, '')

  const supabaseUrl = (process.env.SUPABASE_URL || '').trim()
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  const validUrl = supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')
  if (!validUrl || !supabaseKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server misconfiguration: invalid or missing Supabase env',
        details: !validUrl
          ? 'SUPABASE_URL must be a valid URL (e.g. https://xxxx.supabase.co). Set it in Netlify → Site → Environment variables.'
          : 'SUPABASE_SERVICE_ROLE_KEY is missing. Set it in Netlify → Site → Environment variables.',
      }),
    }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const data = body.data
  if (!data || !Array.isArray(data.categories)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing or invalid data.categories' }) }
  }

  const shareId = uuid()
  const token = randomToken()
  const tokenHash = hashToken(token)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000)

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { error: insertError } = await supabase.from(TABLE).insert({
    id: shareId,
    token_hash: tokenHash,
    data,
    expires_at: expiresAt.toISOString(),
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  })

  if (insertError) {
    console.error(insertError)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create share', details: insertError.message }),
    }
  }

  const shareUrl = `${baseUrl}/#/shared/${shareId}?t=${token}`
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      shareUrl,
      expiresAt: expiresAt.toISOString(),
      id: shareId,
      token,
    }),
  }
  } catch (err) {
    console.error('share-create error:', err)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to create share', details: err.message }),
    }
  }
}
