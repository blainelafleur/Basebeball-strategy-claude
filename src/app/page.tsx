import { GameHeader } from '@/components/game/header';
import { GameBoard } from '@/components/game/game-board';

export default function Home() {
  return (
    <div className="min-h-screen">
      <GameHeader />
      <GameBoard />
    </div>
  );
}
