import Avatar from "@/components/Avatar";
import { SignIn } from "@clerk/nextjs";


function LoginPage() {
  return (
    <div className="flex py-10 md:py-0 flex-col flex-1 justify-center
    items-center bg-[#64B5F5]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col justify-center items-center
        space-y-5 text-white">
          <div className="rounded-full bg-white p-5">
            <Avatar seed="MANEL Support agent" className="h-60 w-60"/>
          </div>

          <div className="text-center">
            <h1 className="text-4xl">AI Assistant</h1>
            <h2 className="text-base font-light">
              Your customizable AI Chat Agent for all your needs
            </h2>
            <h3 className="my-5 font-bold">Sign in to get started</h3>
          </div>
        </div>

        <SignIn routing="hash" fallbackRedirectUrl="/" />
      </div>
    </div>
  );
}

export default LoginPage;