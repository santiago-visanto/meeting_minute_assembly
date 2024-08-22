// app/api/set-audio-url/route.ts
import { NextResponse } from 'next/server'

let audioUrl: string | null = null

export async function POST(request: Request) {
  const { url } = await request.json()
  audioUrl = url
  return NextResponse.json({ success: true })
}

export async function GET() {
  return NextResponse.json({ url: audioUrl })
}