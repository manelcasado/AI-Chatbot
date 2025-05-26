import Avatar from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { GET_CHATBOTS_BY_USER } from "@/graphql/queries";
import { serverClient } from "@/lib/server/serverClient";
import { Chatbot, GetChatbotsByUserData, GetChatbotsByUserDataVariables } from "@/types/types";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link"; // Fix Link import


export const dynamic = 'force-dynamic';

async function ViewChatbots() {
  const {userId} = await auth();
  if (!userId) return null;

  try {
    // Get the chatbots for the user
    const response = await serverClient.query<GetChatbotsByUserData, GetChatbotsByUserDataVariables>({
      query: GET_CHATBOTS_BY_USER,
      variables: {
        clerk_user_id: userId,
      },
    });

    console.log("GraphQL Response:", response); // Add logging

    if (response.error) {
      console.error("GraphQL Error:", response.error);
      return <div>Error loading chatbots. Please try again later.</div>;
    }

    const chatbotsByUser = response?.data?.chatbotsByUser ?? [];
    
    const sortedChatbotsByUser: Chatbot[] = [...chatbotsByUser].sort(
      (a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
      <div className="flex-1 pb-20 p-10">
        <h1 className="text-xl lg:text-3xl font-semibold mb-5">
          Active Chatbots
        </h1>

        {sortedChatbotsByUser.length === 0 && (
          <div>
            <p>
              You haven't created any chatbots yet. Click the button below to create your first one.
            </p>
            <Link href="/create-chatbot">
              <Button className="bg-[#64B5F5] text-white p-3 rounded-md mt-5">
                Create Chatbot
              </Button>
            </Link>
          </div> 
        )}
        
        <ul className="flex flex-col space-y-5">
          {sortedChatbotsByUser.map((chatbot) => (
            <Link key={chatbot.id} href={`/edit-chatbot/${chatbot.id}`}>
              <li className="relative p-10 border rounded-md max-w-3xl bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar seed={chatbot.name}/>
                    <h2 className="text-xl font-bold">{chatbot.name}</h2>
                  </div>

                  <p className="absolute top-5 right-5 text-xs text-gray-400">
                    Created: {new Date(chatbot.created_at).toLocaleDateString()}
                  </p>
                </div>

                <hr className="mt-2" />

                <div className="grid grid-cols-2 gap-10 md:gap-5 p-5">
                  <h3 className="italic">Characteristics:</h3>
                  <ul className="text-xs">
                    {!chatbot.chatbot_characteristics.length && (
                      <p>No characteristics added yet.</p>
                    )}
                    {chatbot.chatbot_characteristics.map((characteristic) => (
                      <li 
                        className="list-disc break-words"
                        key={characteristic.id}
                      >
                        {characteristic.content}
                      </li>
                    ))}

                  </ul>

                  <h3 className="italic">Number of sessions:</h3>
                  <p>{chatbot.chat_sessions.length}</p>
                </div>
              </li>
            </Link>  
          ))}
        </ul>
      </div>
    )
  } catch (error) {
    console.error("Error fetching chatbots:", error);
    return <div>Error loading chatbots. Please try again later.</div>;
  }
}

export default ViewChatbots