import RunHistory from '@/components/RunHistory'

export default function AgentRunHistoryPage({ params }: { params: { id: string } }) {
  return <RunHistory agentId={params.id} />
} 