import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white scroll-smooth relative overflow-hidden">
      {/* RunPod Background */}
      <div className="fixed inset-0 z-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]"></div>
        
        {/* RunPod signature gradients */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Top left */}
          <div className="absolute top-0 left-0 w-[800px] h-[600px] bg-gradient-to-br from-[#6366f1]/10 via-[#8b5cf6]/5 to-transparent rounded-full blur-3xl"></div>
          
          {/* Top right */}
          <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-gradient-to-bl from-[#3b82f6]/10 via-[#6366f1]/5 to-transparent rounded-full blur-3xl"></div>
          
          {/* Bottom left */}
          <div className="absolute bottom-0 left-0 w-[700px] h-[400px] bg-gradient-to-tr from-[#8b5cf6]/10 via-[#a855f7]/5 to-transparent rounded-full blur-3xl"></div>
          
          {/* Bottom right */}
          <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-gradient-to-tl from-[#3b82f6]/10 via-[#1d4ed8]/5 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Floating dots */}
        <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-[#6366f1] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-3/4 left-1/3 w-0.5 h-0.5 bg-[#3b82f6] rounded-full animate-pulse" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-[#8b5cf6] rounded-full animate-pulse" style={{animationDelay: '5s'}}></div>
        <div className="absolute top-2/3 left-1/4 w-0.5 h-0.5 bg-[#6366f1] rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <Navbar />

      <main className="relative z-10">
        {/* Hero Section */}
        <section id="hero" className="scroll-mt-20">
          <Hero />
        </section>

        {/* Features Section */}
        <section id="features" className="scroll-mt-20">
          <Features />
        </section>

        {/* Contact Section Placeholder */}
        <section
          id="contact"
          className="scroll-mt-20 min-h-screen flex items-center justify-center bg-[#0a0a0a]/50 backdrop-blur-sm"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Contact Coming Soon</h2>
            <p className="text-gray-400 text-lg">We&apos;re working on something amazing.</p>
          </div>
        </section>
      </main>
    </div>
  );
}


