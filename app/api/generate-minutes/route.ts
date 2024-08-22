// app/api/generate-minutes/route.ts
import { NextResponse } from 'next/server'
import { ChatFireworks } from '@langchain/community/chat_models/fireworks'
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts'
import { HumanMessage } from '@langchain/core/messages'
import { JsonOutputParser } from '@langchain/core/output_parsers'

const formatInstructions = `Respond only with a valid JSON object, containing nine fields:
'title', 'date', 'attendees', 'summary', 'takeaways', 'conclusions',
'next_meeting', 'tasks' and 'message'`

const parser = new JsonOutputParser()

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `As an expert in minute meeting creation, you are a chatbot designed to 
    facilitate the process of generating meeting minutes efficiently.
                    
    {format_instructions}
    
    Respond in Spanish.

    Ensure that your responses are structured, concise, and provide a 
    comprehensive overview of the meeting proceedings for
    effective record-keeping and follow-up actions and only with json object.`,
  ],
  new MessagesPlaceholder('messages'),
])

const llm = new ChatFireworks({
  modelName: 'accounts/fireworks/models/mixtral-8x7b-instruct',
  temperature: 0,
  modelKwargs: {
    max_tokens: 32768,
  },
})

const chain_writer = prompt.pipe(llm).pipe(parser)

export async function POST() {
  try {
    // Aquí deberías obtener la transcripción generada anteriormente
    const transcription = 'TRANSCRIPCIÓN_GENERADA'

    const request = new HumanMessage({
      content:
        `Today's date is ${new Date().toLocaleDateString('en-GB')}\n.` +
        `This is a transcript of a meeting\n.` +
        `${transcription}\n` +
        `"Your task is to write up for me the minutes of the meeting described above, including all the points of the meeting. ` +
        `The meeting minutes should be approximately 100 words and should be divided into paragraphs ` +
        `using newline characters."`,
    })

    const minutes = await chain_writer.invoke({
      messages: [request],
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

    const reflection = await reflect.invoke({
      messages: [request, new HumanMessage({ content: JSON.stringify(minutes) })],
    })

    return NextResponse.json({ minutes, reflection: reflection.content })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}