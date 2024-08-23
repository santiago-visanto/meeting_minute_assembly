import { NextResponse } from 'next/server';
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const reflectionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are critical of meeting minutes. Its sole purpose is to provide brief feedback on an meeting minutes so the writer knows what to fix. Respond in Spanish.`,
  ],
  new MessagesPlaceholder("messages"),
]);

const llm = new ChatFireworks({
  apiKey: process.env.FIREWORKS_API_KEY,
  modelName: "accounts/fireworks/models/mixtral-8x7b-instruct",
  temperature: 0,
  modelKwargs: { max_tokens: 32768 },
});

const reflect = reflectionPrompt.pipe(llm);

export async function POST(request: Request) {
  const { minutes, reflection } = await request.json();

  try {
    const messages = [
      new HumanMessage({ content: JSON.stringify(minutes) }),
    ];

    if (reflection) {
      messages.push(new AIMessage({ content: reflection }));
    }

    const stream = await reflect.stream({
      messages: messages,
    });

    let result = '';
    for await (const chunk of stream) {
      result += chunk.content;
    }

    return NextResponse.json({ reflection: result });
  } catch (error) {
    console.error('Error generating reflection:', error);
    return NextResponse.json({ error: 'Failed to generate reflection' }, { status: 500 });
  }
}