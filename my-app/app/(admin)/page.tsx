import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
      <main className="p-10 bg-white m-10 rounded-md w-full">
        <h1 className="text-4xl font-light"> 
          Welcome to{" "}
          <span className="text-[#64B5F5] font-semibold">MyAIssistant</span>!
        </h1>
        <h2 className="mt-2 mb-10">
          Your customizable AI Chat Agent that helps you manage your 
          customer conversations and needs.
        </h2>
        <Link href="/create-chatbot">
          <Button className="bg-[#64B5F5]">
            Let's create your first chatbot
          </Button>
        </Link>
      </main>
  );
}
