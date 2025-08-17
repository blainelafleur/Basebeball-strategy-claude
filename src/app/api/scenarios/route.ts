import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const scenarios = await prisma.scenario.findMany({
      where: {
        isPublic: true,
        ...(category && { category }),
      },
      orderBy: {
        timesPlayed: 'desc',
      },
    });

    // If no scenarios in database, return hardcoded ones for now
    if (scenarios.length === 0) {
      const { scenarios: hardcodedScenarios } = await import('@/lib/scenarios');
      
      // Convert hardcoded scenarios to match database format
      const scenariosArray = Object.values(hardcodedScenarios).map(scenario => ({
        ...scenario,
        options: scenario.options,
        explanations: scenario.explanations,
        successRates: scenario.successRates,
        category: category || 'general',
        difficulty: 'INTERMEDIATE' as const,
        inning: scenario.situation.inning,
        score: scenario.situation.score,
        count: scenario.situation.count || null,
        runners: scenario.situation.runners,
        outs: null,
        weatherConditions: null,
        videoUrl: null,
        mlbExample: null,
        tags: '[]',
        createdById: null,
        isPublic: true,
        timesPlayed: 0,
        averageScore: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      if (category) {
        const filteredScenarios = scenariosArray.filter(s => 
          s.category === category || Object.keys(hardcodedScenarios).includes(category)
        );
        return NextResponse.json({ scenarios: filteredScenarios });
      }

      return NextResponse.json({ scenarios: scenariosArray });
    }

    return NextResponse.json({ scenarios });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json({ error: 'Failed to fetch scenarios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      difficulty = 'INTERMEDIATE',
      inning,
      score,
      count,
      runners,
      outs,
      weatherConditions,
      options,
      bestChoice,
      explanations,
      successRates,
      videoUrl,
      mlbExample,
      tags = '[]',
      isPublic = true,
    } = body;

    const scenario = await prisma.scenario.create({
      data: {
        title,
        description,
        category,
        difficulty,
        inning,
        score,
        count,
        runners,
        outs,
        weatherConditions,
        options,
        bestChoice,
        explanations,
        successRates,
        videoUrl,
        mlbExample,
        tags,
        isPublic,
      },
    });

    return NextResponse.json({ scenario }, { status: 201 });
  } catch (error) {
    console.error('Error creating scenario:', error);
    return NextResponse.json({ error: 'Failed to create scenario' }, { status: 500 });
  }
}