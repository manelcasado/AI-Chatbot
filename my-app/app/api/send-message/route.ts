import { INSERT_MESSAGE } from "@/graphql/mutations";
import { GET_CHATBOT_BY_ID, GET_MESSAGES_BY_CHAT_SESSION_ID } from "@/graphql/queries";
import { serverClient } from "@/lib/server/serverClient";
import { MessagesByChatSessionIdResponse, GetChatbotByIdResponse } from "@/types/types";
import {NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {                             // extra headers are optional
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "",
    "X-Title": process.env.NEXT_PUBLIC_SITE_NAME ?? "",
  },
});

export async function POST(req: NextRequest) {
  const now = new Date().toISOString();
  const { chat_session_id, chatbot_id, content, name } = await req.json();

  console.log(`Received message from chat session ${chat_session_id}: ${content} (chatbot: ${chatbot_id})`);

  try {
    // Step 1: Fetch chatbot characteristics
    const { data } = await serverClient.query<GetChatbotByIdResponse>({
      query: GET_CHATBOT_BY_ID,
      variables: { id: chatbot_id },
    });

    const chatbot = data.chatbots;

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    // Step 2: Fetch previous messages
    const { data: messagesData } = 
    await serverClient.query<MessagesByChatSessionIdResponse>({
      query: GET_MESSAGES_BY_CHAT_SESSION_ID,
      variables: { chat_session_id },
      fetchPolicy: "no-cache",
    });

    const previousMessages = messagesData.chat_sessions.messages;

    const formattedPreviousMessages: ChatCompletionMessageParam[] = previousMessages.map ((message) => ({
      role: message.sender === "ai" ? "assistant" : "user",
      ...(message.sender !== "ai" && { name }),
      content: message.content,
    }));

    // Combine characteristics into a system prompt
    const systemPrompt = chatbot.chatbot_characteristics.map((c) => c.content).join(" + ");
    
    console.log(systemPrompt);

    // Tells openai what's going on
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        name: "system",
        content: `You are a helpful assistant talking to ${name}. If a generic question is asked which is not
        relevant or in the same scope or domain as the points mentioned in the key information section, kindly
        infrom the user they are only allowed to search for the specified content. Use Emojis's where possible.
        Here is some key information that you need to be aware of, these are elements you may be asked about:
        ${systemPrompt}`,
      },
      ...formattedPreviousMessages,
      {
        role: "user",
        name,
        content: content,
      },
    ]

    // Step 3: Send the message to OpenAI's completeions API
    const openaiResponse = await openai.chat.completions.create({
      messages: messages,
      model: "deepseek/deepseek-r1-0528:free",
    });

    console.log("OpenAI raw response:", openaiResponse);

    const aiResponse = openaiResponse?.choices?.[0]?.message?.content?.trim();

    if (!aiResponse) {
      return NextResponse.json(
        { error: "Failed to generate AI response" },
        { status: 500 }
      );
    }

    // Step 4: Sace the user's message in the database
    await serverClient.mutate({
      mutation: INSERT_MESSAGE,
      variables: { chat_session_id, content, sender: "user", created_at: now },
    });

    // Step 5: Save the AI's response in the database
    const aiMessageResult = await serverClient.mutate({
      mutation: INSERT_MESSAGE,
      variables: { chat_session_id, content: aiResponse, sender: "ai", created_at: now },
    });

    // Step 6: Return the AI's response to the client
    return NextResponse.json({
      id: aiMessageResult.data.insertMessages.id,
      content: aiResponse,
    });

  } catch (error) {
    console.error("Error sending messgae:", error);
    return NextResponse.json({ error }, { status: 500 });
  }

}