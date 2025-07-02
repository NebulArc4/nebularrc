import RunHistory from '@/components/RunHistory'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AgentRunHistoryPage({ params }: any) {
  return <RunHistory agentId={params.id} />
} 