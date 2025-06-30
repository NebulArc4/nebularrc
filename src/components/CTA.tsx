import WaitlistForm from "@/components/WaitlistForm";

export default function CTA() {
  return (
    <section
      id="cta"
      className="bg-[#1f1f1f] py-16 px-6 text-center text-white border-t border-[#333]"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to unlock your AI Twin?
        </h2>
        <p className="text-lg text-gray-300 mb-8">
          Be among the first to experience Nebul<span className="text-red-500">A</span>rc's decision intelligence platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
          <button className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5b21b6] hover:to-[#6366f1] transition-all duration-200 px-6 py-3 rounded-lg font-semibold text-white flex items-center space-x-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Start Free Trial</span>
          </button>
          <button className="bg-[#2a2a2a] hover:bg-[#333] transition-all duration-200 px-6 py-3 rounded-lg font-semibold text-white border border-[#444] flex items-center space-x-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Contact Sales</span>
          </button>
        </div>

        <WaitlistForm />
      </div>
    </section>
  )
}
