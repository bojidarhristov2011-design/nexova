import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { db } from '@/lib/db'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params
  const agent = await db.agent.findUnique({ where: { id: agentId } })
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  const { messages } = await request.json()
  if (!messages?.length) return NextResponse.json({ error: 'No messages' }, { status: 400 })

  const history = messages.map((m: { role: string; content: string }) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user' as 'user' | 'assistant',
    content: m.content,
  }))

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: agent.instructions },
            ...history,
          ],
          stream: true,
          temperature: 0.7,
        })
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? ''
          if (text) controller.enqueue(encoder.encode(text))
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'AI error'
        controller.enqueue(encoder.encode(`Error: ${msg}`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
