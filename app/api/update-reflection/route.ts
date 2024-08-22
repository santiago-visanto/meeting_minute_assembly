// app/api/update-reflection/route.ts
import { NextResponse } from 'next/server'
import { ChatFireworks } from '@langchain/community/chat_models/fireworks'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { HumanMessage } from '@langchain/core/messages'

const llm = new ChatFireworks({
  modelName: 'accounts/fireworks/models/mixtral-8x7b-instruct',
  temperature: 0,
  modelKwargs: {
    max_tokens: 32768,
  },
})

const reflectionPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are critical of meeting minutes. Its sole purpose is to provide brief feedback on an 
    meeting minutes so the writer knows what to fix.
    Respond in Spanish`,
  ],
  new MessagesPlaceholder('messages'),
])

const reflect = reflectionPrompt.pipe(llm)

export async function POST(request: Request) {
  try {
    const { reflection } = await request.json()

    // Aquí deberías obtener la transcripción y las actas generadas anteriormente
    const transcription = 'TRANSCRIPCIÓN_GENERADA'
    const minutes = 'ACTAS_GENERADAS'

    const updatedReflection = await reflect.invoke({
      messages: [
        new HumanMessage({ content: transcription }),
        new HumanMessage({ content: JSON.stringify(minutes) }),
        new HumanMessage({ content: reflection }),
      ],
    })

    return NextResponse.json({ updatedReflection: updatedReflection.content })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}