import AgentRunner from '@/components/AgentRunner'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AgentRunPage({ params }: any) {
  return <AgentRunner agentId={params.id} />
} 