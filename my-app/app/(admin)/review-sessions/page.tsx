import ChatbotSessions from "@/components/ChatbotSessions";
import { GET_USER_CHATBOTS } from "@/graphql/queries";
import { serverClient } from "@/lib/server/serverClient";
import { Chatbot, GetUserChatbotsResponse, GetUserChatbotsVariables } from "@/types/types";
import { auth } from "@clerk/nextjs/server";

async function ReviewSessions() {
  const { userId } = await auth();
  if (!userId) return null;

  const {
    data: {chatbotsByUser},
  } = await serverClient.query<GetUserChatbotsResponse, GetUserChatbotsVariables>({
    query: GET_USER_CHATBOTS,
    variables: { userId },
  });

  const sortedChatbotsByUser: Chatbot[] = chatbotsByUser.map((chatbot) => ({
    ...chatbot,
    chat_sessions: [...chatbot.chat_sessions].sort(
      (a, b) =>
        // Sort in ascending order
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
  }));

  return (
    <div>
      <h1 className="text-xl lg:text-3xl font-semibold mt10">
        Chat Sessions
      </h1>
      <h2 className="font-light mb-5">
        Review the chat sessions that your chatbots have had with your costumers.
      </h2>

      <ChatbotSessions chatbots={sortedChatbotsByUser} />
    </div>
  )
}

export default ReviewSessions