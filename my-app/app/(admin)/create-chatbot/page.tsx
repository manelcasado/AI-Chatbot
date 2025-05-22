"use client";

import Avatar from '@/components/Avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { FormEvent, useState } from 'react'
import { useMutation } from '@apollo/client'
import { CREATE_CHATBOT } from '@/graphql/mutations'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

function CreateChatbot() {
  const { user } = useUser();
  const [name, setName] = useState("");
  const router = useRouter();

  const [createChatbot, {data, loading, error}] = useMutation(
    CREATE_CHATBOT,
    {
      variables: {
        clerk_user_id: user?.id,
        name,
        created_at: new Date().toISOString(),
      },
    }
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await createChatbot();
      setName("");
      console.log("CreateChatbot mutation result:", result);
      const chatbotId = result?.data?.insertChatbots?.id;
      if (chatbotId) {
        router.push(`/edit-chatbot/${chatbotId}`);
      } else {
        console.error("No chatbot ID returned:", result);
        // Optionally show a user-facing error here
      }
    } catch (err) {
      console.error("Error creating chatbot:", err);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center md:flex-row md:space-x-10 bg-white p-10 rounded-md m-10">
      <Avatar seed="create-chatbot" />
      <div>
        <h1 className='text-xl lg:text-3xl font-semibold'>Create</h1>
        <h2 className='folt-light'>
            Create a new chatbot to assist you in your conversations with your costumers.
        </h2>
        <form onSubmit={handleSubmit} className='flex flex-col md:flex-row gap-2 mt-5'>
          <Input 
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Chatbot Name...' 
            className='max-w-lg' 
            required
          />
          <Button type="submit" disabled={loading || !name}>
            {loading ? "Creating Chatbot..." : "Create Chatbot"}
          </Button>
        </form>

        <p className="text-gray-300 mt-5">Example: Customer Support Chatbot</p>
      </div>
    </div>
  )
}

export default CreateChatbot