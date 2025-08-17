import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scenarios } from '@/lib/scenarios';

export async function POST() {
  try {
    // Check if scenarios already exist
    const existingScenarios = await prisma.scenario.count();
    
    if (existingScenarios > 0) {
      return NextResponse.json({ 
        message: 'Scenarios already exist in database',
        count: existingScenarios 
      });
    }

    // Convert hardcoded scenarios to database format
    const scenarioPromises = Object.entries(scenarios).map(([category, scenario]) =>
      prisma.scenario.create({
        data: {
          id: scenario.id,
          title: scenario.title,
          description: scenario.description,
          category,
          difficulty: 'INTERMEDIATE',
          inning: scenario.situation.inning,
          score: scenario.situation.score,
          count: scenario.situation.count || null,
          runners: scenario.situation.runners,
          outs: null,
          weatherConditions: null,
          options: scenario.options,
          bestChoice: scenario.bestChoice,
          explanations: scenario.explanations,
          successRates: scenario.successRates,
          videoUrl: null,
          mlbExample: null,
          tags: JSON.stringify([category, 'demo']),
          isPublic: true,
          timesPlayed: 0,
          averageScore: null,
        },
      })
    );

    const createdScenarios = await Promise.all(scenarioPromises);

    return NextResponse.json({
      message: 'Scenarios seeded successfully',
      count: createdScenarios.length,
      scenarios: createdScenarios.map(s => ({ id: s.id, title: s.title, category: s.category }))
    });
  } catch (error) {
    console.error('Error seeding scenarios:', error);
    return NextResponse.json(
      { error: 'Failed to seed scenarios', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}