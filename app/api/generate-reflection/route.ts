import { NextResponse } from 'next/server';
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { JsonOutputParser } from "@langchain/core/output_parsers";

const formatInstructions = `Respond the new meeting only with a valid JSON object, containing nine fields: 
'title', 'date', 'attendees', 'summary', 'takeaways', 'conclusions', 'next_meeting', 'tasks' and 'message'\n
`;


const reflectionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `
    You are an expert meeting minutes creator in Spanish. Your sole purpose is to edit well-written minutes based on given critique\n 

                       ${formatInstructions}\n

                       "title": Title of the meeting,
                       "date": Date of the meeting,
                       "attendees": List of dictionaries of the meeting attendees. The dictionaries must have the following key values: "name", "position" and "role". The "role" key refers to the attendee's function in the meeting. If any of the values of these keys is not clear or is not mentioned, it is given the value "none".
                       "summary": "succinctly summarize the minutes of the meeting in 3 clear and coherent paragraphs. Separete paragraphs using newline characters.",
                       "takeaways": List of the takeaways of the meeting minute,
                       "conclusions": List of conclusions and actions to be taken,
                       "next_meeting": List of the commitments made at the meeting. Be sure to go through the entire content of the meeting before giving your answer,
                       "tasks": List of dictionaries for the commitments acquired in the meeting. The dictionaries must have the following key values "responsible", "date" and "description". In the key-value  "description", it is advisable to mention specifically what the person in charge is expected to do instead of indicating general actions. Be sure to include all the items in the next_mmeting list,
                       "message": "message to the critique",
                 
                     Respond in Spanish.\n
                 
    `,
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