import { useParams } from 'react-router-dom';

export function GamePlayerPage() {
  const { gameId } = useParams();

  return (
    <div className="gameplay-mode">
      <div id="emulator-container" className="h-full w-full">
        <p className="text-pixel text-center text-sm text-skull-white">
          Loading game {gameId}...
        </p>
        {/* EmulatorJS will be mounted here */}
      </div>
    </div>
  );
}
