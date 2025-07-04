'use client'
import { useRouter } from 'next/navigation'

export default function JoinTeamButton() {
  const router = useRouter();
  return (
    <button
      className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white px-6 py-3 rounded-lg font-semibold shadow hover:from-[#5b21b6] hover:to-[#6366f1] transition-all duration-200"
      onClick={() => router.push('/dashboard/join')}
    >
      Join as Team Member
    </button>
  );
} 