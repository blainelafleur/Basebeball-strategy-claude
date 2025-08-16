import { NextResponse } from 'next/server';

// Simple health check endpoint for Railway
export async function GET() {
  try {
    // Basic health check - just return success
    // Don't test database connection here to avoid blocking health checks
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      port: process.env.PORT || 8080,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';
