import { NextResponse } from 'next/server';
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";
import { JsonOutputParser } from "@langchain/core/output_parsers";

const formatInstructions = `Respond only with a valid JSON object, containing nine fields: 
'title', 'date', 'attendees', 'summary', 'takeaways', 'conclusions', 'next_meeting', 'tasks' and 'message'\n
`;

const parser = new JsonOutputParser();

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `As an expert in minute meeting creation, you are a chatbot designed to facilitate the process of generating meeting minutes efficiently.\n

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

  const content = `Today's date is ${today}\n. This is a transcript of a meeting.\n-----\n ${transcript}\n -----\n
                    Your task is to write up for me the minutes of the meeting described above, 
                    including all the points of the meeting. The meeting minutes should be approximately ${wordCount} words 
                    and should be divided into paragraphs using newline characters.`;

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