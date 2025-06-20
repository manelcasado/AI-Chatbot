import Messages from "@/components/Messages";
import { GET_CHAT_SESSION_MESSAGES } from "@/graphql/queries";
import { serverClient } from "@/lib/server/serverClient";
import { GetChatSessionMessagesResponse, GetChatSessionMessagesVariables } from "@/types/types";

export const dynamic = 'force-dynamic';

type ReviewSessionPageProps = { params: Promise<{ id: string }> };

export default async function ReviewSession(
  { params }: ReviewSessionPageProps) {
  const {
    data: {
      chat_sessions: {
        id: chatSessionId,
        created_at,
        messages,
        chatbots: { name },
        guests: { name: guestName, email },
      },
    },
  } = await serverClient.query<
    GetChatSessionMessagesResponse,
    GetChatSessionMessagesVariables
  >({
    query: GET_CHAT_SESSION_MESSAGES,
    variables: { id: Number((await params).id) },
  });
  
  return (
    <div className="flex-1 pb-24 p-10">
      <h1 className="text-xl lg:text-3xl font-semibold">
        Session Review
      </h1>
      <p className="font-light text-xs text-gray-400 mt-2">
        Started at {new Date(created_at).toLocaleString()}
      </p>

      <h2 className="font-light mt-2">
        Between {name} & {""}
        <span className="font-extrabold">
          {guestName} ({email})
        </span>
      </h2>

      <hr className="my-10" />
      
      <Messages messages={messages} chatbotName={name}/>
    </div>
  );
}