import AgentRunner from '@/components/AgentRunner'

export default function AgentRunPage({ params }: { params: { id: string } }) {
  return <AgentRunner agentId={params.id} />
} 