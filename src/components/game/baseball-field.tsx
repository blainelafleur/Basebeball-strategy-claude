'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGameStore } from '@/lib/store';
import { useEffect, useRef } from 'react';
import { TrendingUp } from 'lucide-react';

export function BaseballField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentScenario, playerStats, lastOutcome } = useGameStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawBase = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      label: string,
      scale: number
    ) => {
      const size = 8 * scale;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - size / 2, y - size / 2, size, size);

      ctx.fillStyle = '#000000';
      ctx.font = `${Math.max(10, 12 * scale)}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y - 15 * scale);
    };

    const drawRunner = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) => {
      // Runner circle
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y - 15 * scale, 6 * scale, 0, 2 * Math.PI);
      ctx.fill();

      // Runner emoji
      ctx.font = `${Math.max(12, 16 * scale)}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('🏃', x, y - 25 * scale);
    };

    const animateOutcome = (
      ctx: CanvasRenderingContext2D,
      category: string,
      width: number,
      height: number
    ) => {
      const colors = {
        success: 'rgba(34, 197, 94, 0.2)',
        warning: 'rgba(245, 158, 11, 0.2)',
        danger: 'rgba(239, 68, 68, 0.2)',
      };

      ctx.fillStyle = colors[category as keyof typeof colors] || colors.danger;
      ctx.fillRect(0, 0, width, height);
    };

    const drawField = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Field background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#2d5016');
      gradient.addColorStop(0.5, '#3d6b1f');
      gradient.addColorStop(1, '#2d5016');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.85;
      const scale = Math.min(width, height) / 500;

      // Infield dirt
      ctx.fillStyle = '#8d6e63';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX - 100 * scale, centerY - 100 * scale);
      ctx.lineTo(centerX, centerY - 140 * scale);
      ctx.lineTo(centerX + 100 * scale, centerY - 100 * scale);
      ctx.closePath();
      ctx.fill();

      // Pitcher's mound
      ctx.fillStyle = '#6d4c41';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - 50 * scale, 12 * scale, 6 * scale, 0, 0, 2 * Math.PI);
      ctx.fill();

      // Bases
      drawBase(ctx, centerX, centerY, 'H', scale);
      drawBase(ctx, centerX + 80 * scale, centerY - 80 * scale, '1B', scale);
      drawBase(ctx, centerX, centerY - 140 * scale, '2B', scale);
      drawBase(ctx, centerX - 80 * scale, centerY - 80 * scale, '3B', scale);

      // Foul lines
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(0, 0);
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(width, 0);
      ctx.stroke();
    };

    const drawGameSituation = (
      ctx: CanvasRenderingContext2D,
      situation: { runners: string },
      width: number,
      height: number
    ) => {
      const centerX = width / 2;
      const centerY = height * 0.85;
      const scale = Math.min(width, height) / 500;

      const runnerPositions = [
        { base: '1st', x: centerX + 80 * scale, y: centerY - 80 * scale },
        { base: '2nd', x: centerX, y: centerY - 140 * scale },
        { base: '3rd', x: centerX - 80 * scale, y: centerY - 80 * scale },
      ];

      runnerPositions.forEach((pos) => {
        if (
          situation.runners.includes(pos.base) ||
          situation.runners.includes('Bases Loaded') ||
          (situation.runners.includes('You on 1st') && pos.base === '1st') ||
          (situation.runners.includes('Runner on 3rd') && pos.base === '3rd')
        ) {
          drawRunner(ctx, pos.x, pos.y, scale);
        }
      });
    };

    drawField(ctx, canvas.width, canvas.height);

    if (currentScenario?.situation) {
      drawGameSituation(ctx, currentScenario.situation, canvas.width, canvas.height);
    }

    if (lastOutcome) {
      animateOutcome(ctx, lastOutcome.category, canvas.width, canvas.height);
    }
  }, [currentScenario, lastOutcome]);

  return (
    <div className="space-y-6">
      {/* Field Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>⚾</span>
            <span>Game Field</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full aspect-[3/2] bg-gradient-to-b from-green-600 to-green-700 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full h-full object-contain"
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <span>Performance Today</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Success Rate Circle */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted-foreground/20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - playerStats.successRate / 100)}
                  className="text-blue-400 transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-blue-400">
                  {Math.round(playerStats.successRate)}%
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level Progress</span>
              <span>{playerStats.level}</span>
            </div>
            <Progress value={playerStats.points % 50} max={50} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {50 - (playerStats.points % 50)} points to next level
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
