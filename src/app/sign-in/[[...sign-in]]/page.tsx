import { SignIn } from "@clerk/nextjs";

/**
 * Sign In Page
 * Uses Clerk's pre-built SignIn component with redirect to dashboard
 */
export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <SignIn 
        forceRedirectUrl="/dashboard"
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

