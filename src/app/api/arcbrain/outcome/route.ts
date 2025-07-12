import { NextRequest, NextResponse } from 'next/server';
import { aiMemory } from '@/lib/ai-memory';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { decision_id, outcome } = body;

    if (!decision_id || !outcome) {
      return NextResponse.json(
        { error: 'Missing required fields: decision_id and outcome' },
        { status: 400 }
      );
    }

    // Validate outcome structure
    const requiredFields = ['success_level', 'actual_impact', 'actual_results', 'lessons_learned', 'accuracy_score'];
    for (const field of requiredFields) {
      if (!(field in outcome)) {
        return NextResponse.json(
          { error: `Missing required outcome field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate success_level
    const validSuccessLevels = ['excellent', 'good', 'moderate', 'poor', 'failed'];
    if (!validSuccessLevels.includes(outcome.success_level)) {
      return NextResponse.json(
        { error: `Invalid success_level. Must be one of: ${validSuccessLevels.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate accuracy_score
    if (typeof outcome.accuracy_score !== 'number' || outcome.accuracy_score < 0 || outcome.accuracy_score > 100) {
      return NextResponse.json(
        { error: 'accuracy_score must be a number between 0 and 100' },
        { status: 400 }
      );
    }

    // Update the decision outcome in AI memory
    await aiMemory.updateOutcome(decision_id, outcome);

    // Get updated memory statistics
    const memoryStats = aiMemory.getMemoryStats();

    return NextResponse.json({
      success: true,
      message: 'Decision outcome updated successfully',
      memory_stats: memoryStats
    });

  } catch (error) {
    console.error('Error updating decision outcome:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return memory statistics
    const memoryStats = await aiMemory.getMemoryStats();
    
    return NextResponse.json({
      memory_stats: memoryStats
    });
  } catch (error) {
    console.error('Error getting memory stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 