import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  let body: unknown

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowe żądanie JSON.' }, { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('prompt' in body) ||
    typeof body.prompt !== 'string' ||
    !body.prompt.trim()
  ) {
    return NextResponse.json({ error: 'Pole prompt jest wymagane.' }, { status: 400 })
  }

  if (body.prompt.length > 20_000) {
    return NextResponse.json({ error: 'Prompt może mieć maksymalnie 20 000 znaków.' }, { status: 413 })
  }

  const systemPrompt = 'systemPrompt' in body ? body.systemPrompt : undefined
  if (systemPrompt !== undefined && typeof systemPrompt !== 'string') {
    return NextResponse.json({ error: 'Pole systemPrompt musi być tekstem.' }, { status: 400 })
  }

  if (typeof systemPrompt === 'string' && systemPrompt.length > 4_000) {
    return NextResponse.json({ error: 'Instrukcja systemowa może mieć maksymalnie 4 000 znaków.' }, { status: 413 })
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Brak konfiguracji klucza API DeepSeek.' }, { status: 503 })
  }

  try {
    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey,
    })

    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: typeof systemPrompt === 'string' && systemPrompt.trim()
            ? systemPrompt.trim()
            : 'Jesteś pomocnym asystentem.',
        },
        { role: 'user', content: body.prompt.trim() },
      ],
    })

    return NextResponse.json({ result: response.choices[0]?.message.content ?? null })
  } catch (error) {
    console.error('Błąd DeepSeek API:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas połączenia z API DeepSeek.' },
      { status: 500 },
    )
  }
}
