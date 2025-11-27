import { HeroGeometric } from "@workspace/ui/components/shape-landing-hero";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

function HeroGeometricDemo() {
  return (
    <HeroGeometric
      badge="MOM AI"
      title1="AI-Powered Technical"
      title2="Support System"
    />
  );
}

export default function HomePage() {
  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-4 gap-4 h-16 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg leading-tight">MOM AI</span>
            <span className="text-white/60 text-xs leading-tight">momai252025@gmail.com</span>
          </div>
          <div className="ml-2 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400">
            Secured by Development
          </div>
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton>
              <button className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="bg-gradient-to-r from-indigo-500 to-rose-500 text-white rounded-full font-medium text-sm px-6 py-2 hover:from-indigo-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <a href="/dashboard" className="bg-white/10 hover:bg-white/20 text-white rounded-full font-medium text-sm px-6 py-2 transition-all border border-white/20 hover:border-white/30">
              Dashboard
            </a>
            <UserButton />
          </SignedIn>
        </div>
      </header>
      <main className="min-h-screen">
        <HeroGeometricDemo />
      </main>
    </>
  );
}