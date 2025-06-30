export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
      {/* Main content */}
      <div className="relative z-10 max-w-4xl w-full mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
            Nebul<span className="text-red-500">A</span>rc
          </span>
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-gray-300 leading-relaxed">
          Autonomous AI infrastructure for the next generation of decision-making, research, and strategy.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5b21b6] hover:to-[#6366f1] transition-all duration-200 px-6 py-3 rounded-lg font-semibold text-white flex items-center space-x-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Get Started</span>
          </button>
          <button className="bg-[#1f1f1f] hover:bg-[#2a2a2a] transition-all duration-200 px-6 py-3 rounded-lg font-semibold text-white border border-[#333] flex items-center space-x-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>View Documentation</span>
          </button>
        </div>
      </div>
    </section>
  );
}

