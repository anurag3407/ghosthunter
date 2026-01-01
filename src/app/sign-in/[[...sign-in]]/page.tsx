import { SignIn } from "@clerk/nextjs";

/**
 * Sign In Page
 * Uses Clerk's pre-built SignIn component
 */
export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-zinc-900 border border-zinc-800",
          },
        }}
      />
    </div>
  );
}
