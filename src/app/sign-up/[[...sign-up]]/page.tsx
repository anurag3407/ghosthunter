import { SignUp } from "@clerk/nextjs";

/**
 * Sign Up Page
 * Uses Clerk's pre-built SignUp component with redirect to dashboard
 */
export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <SignUp 
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

