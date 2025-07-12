import { NextResponse } from 'next/server';
import { getRealtimeRisk } from '@/lib/realtime-risk';

export async function GET() {
  try {
    const risk = await getRealtimeRisk();
    return NextResponse.json(risk);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 