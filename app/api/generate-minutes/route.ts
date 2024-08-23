import { NextResponse } from 'next/server';
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";
import { JsonOutputParser } from "@langchain/core/output_parsers";

const formatInstructions = `Respond only with a valid JSON object, containing nine fields: 'title', 'date', 'attendees', 'summary', 'takeaways', 'conclusions', 'next_meeting', 'tasks' and 'message';`;

const parser = new JsonOutputParser();

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `As an expert in minute meeting creation, you are a chatbot designed to facilitate the process of generating meeting minutes efficiently.

    ${formatInstructions}

    Respond in Spanish.

    Ensure that your responses are structured, concise, and provide a 
    comprehensive overview of the meeting proceedings for
    effective record-keeping and follow-up actions and only with json object.`,
  ],
  new MessagesPlaceholder("messages"),
]);

const llm = new ChatFireworks({
  apiKey: process.env.FIREWORKS_API_KEY,
  modelName: "accounts/fireworks/models/mixtral-8x7b-instruct",
  temperature: 0,
  modelKwargs: { max_tokens: 32768 },
});

const chain_writer = prompt.pipe(llm).pipe(parser);

export async function POST(request: Request) {
  const { transcript, wordCount } = await request.json();

  const today = new Date().toLocaleDateString('en-GB');
  const content = `Today's date is ${today}\n. This is a transcript of a meeting\n. ${transcript}\n Your task is to write up for me the minutes of the meeting described above, including all the points of the meeting. The meeting minutes should be approximately ${wordCount} words and should be divided into paragraphs using newline characters.`;

  const request_message = new HumanMessage({ content });

  try {
    const result = await chain_writer.invoke({
      messages: [request_message],
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating minutes:', error);
    return NextResponse.json({ error: 'Failed to generate minutes' }, { status: 500 });
  }
}