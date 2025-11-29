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

function FeaturesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Powerful Features for Modern
            <span className="bg-gradient-to-r from-indigo-400 to-rose-400 bg-clip-text text-transparent"> Support</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the next generation of customer support with AI-powered intelligence.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 hover:border-indigo-500/50 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-lg flex items-center justify-center mb-6">
              <span className="text-white font-bold">AI</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Intelligent AI Support</h3>
            <p className="text-gray-400">Advanced AI-powered customer support with contextual understanding.</p>
          </div>
          
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 hover:border-indigo-500/50 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-lg flex items-center justify-center mb-6">
              <span className="text-white font-bold">RT</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Real-time Chat</h3>
            <p className="text-gray-400">Seamless real-time conversations with instant synchronization.</p>
          </div>
          
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 hover:border-indigo-500/50 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-lg flex items-center justify-center mb-6">
              <span className="text-white font-bold">KB</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Knowledge Base</h3>
            <p className="text-gray-400">Upload documents to create comprehensive knowledge bases.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About <span className="bg-gradient-to-r from-indigo-400 to-rose-400 bg-clip-text text-transparent">MOM AI</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            MOM AI is an advanced technical support system built by MOM Digital. 
            We provide intelligent customer support solutions that understand context and deliver exceptional experiences.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignUpButton>
              <button className="bg-gradient-to-r from-indigo-500 to-rose-500 text-white rounded-full font-semibold px-8 py-3 hover:from-indigo-600 hover:to-rose-600 transition-all shadow-lg">
                Get Started
              </button>
            </SignUpButton>
            <a href="https://momdigital.io" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold px-8 py-3 transition-all border border-white/20 text-center">
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-indigo-900 via-purple-900 to-rose-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Transform Your
          <span className="bg-gradient-to-r from-indigo-300 to-rose-300 bg-clip-text text-transparent"> Customer Support?</span>
        </h2>
        <p className="text-xl text-gray-200 mb-10">
          Join businesses using MOM AI for exceptional customer experiences.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <SignUpButton>
            <button className="bg-white text-gray-900 rounded-full font-semibold px-8 py-4 hover:bg-gray-100 transition-all shadow-lg">
              Start Free Trial
            </button>
          </SignUpButton>
          <a href="https://momdigital.io/new-form/" target="_blank" rel="noopener noreferrer" className="bg-transparent border-2 border-white text-white rounded-full font-semibold px-8 py-4 hover:bg-white hover:text-gray-900 transition-all">
            Schedule Demo
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
              <span className="text-white font-bold text-xl">MOM AI</span>
            </div>
            <p className="text-gray-400 mb-6">
              AI-powered technical support by MoM Digital.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="https://momdigital.io" className="hover:text-white transition-colors">MoM Digital</a></li>
              <li><a href="https://momdigital.io/new-form/" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <div className="space-y-3 text-gray-400">
              <div>info@momdigital.io</div>
              <div>+971 50 748 3942</div>
              <div>Dubai, UAE</div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">© 2025 MoM Digital. All rights reserved.</p>
        </div>
      </div>
    </footer>
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
          <span className="text-white font-bold text-lg leading-tight">MOM AI</span>
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
        <FeaturesSection />
        <AboutSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}