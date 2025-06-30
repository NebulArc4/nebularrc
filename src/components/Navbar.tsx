'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1f1f1f]">
      <div className="flex justify-between items-center px-6 py-4 max-w-screen-2xl mx-auto">
        {/* Logo + Name */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="text-xl font-bold text-white">
            Nebul<span className="text-red-500">A</span>rc
          </span>
        </Link>
        
        {/* Navigation */}
        <ul className="hidden md:flex items-center space-x-6 text-gray-300 text-sm font-medium">
          <li><Link href="#product" className="hover:text-white transition-colors duration-200">Product</Link></li>
          <li><Link href="#usecases" className="hover:text-white transition-colors duration-200">Use Cases</Link></li>
          <li><Link href="#resources" className="hover:text-white transition-colors duration-200">Resources</Link></li>
          <li><Link href="#company" className="hover:text-white transition-colors duration-200">Company</Link></li>
          <li><Link href="#docs" className="hover:text-white transition-colors duration-200">Docs</Link></li>
          <li><Link href="#pricing" className="hover:text-white transition-colors duration-200">Pricing</Link></li>
        </ul>
        
        {/* Auth Buttons */}
        <div className="flex items-center space-x-3">
          <Link 
            href="/auth" 
            className="text-gray-400 hover:text-white transition-colors duration-200 font-medium text-sm"
          >
            Sign In
          </Link>
          <Link 
            href="/auth" 
            className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5b21b6] hover:to-[#6366f1] transition-all duration-200 px-4 py-2 rounded-lg font-semibold text-white text-sm"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}

