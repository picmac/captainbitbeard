import { type Game } from '../services/api';

interface GameMetadataDisplayProps {
  game: Game;
}

export function GameMetadataDisplay({ game }: GameMetadataDisplayProps) {
  return (
    <div className="space-y-3">
      {/* Developer */}
      {game.developer && (
        <div>
          <p className="text-pixel text-[10px] text-wood-brown uppercase">Developer</p>
          <p className="text-pixel text-sm text-ocean-dark mt-1">{game.developer}</p>
        </div>
      )}

      {/* Publisher */}
      {game.publisher && (
        <div>
          <p className="text-pixel text-[10px] text-wood-brown uppercase">Publisher</p>
          <p className="text-pixel text-sm text-ocean-dark mt-1">{game.publisher}</p>
        </div>
      )}

      {/* Genre */}
      {game.genre && (
        <div>
          <p className="text-pixel text-[10px] text-wood-brown uppercase">Genre</p>
          <p className="text-pixel text-sm text-ocean-dark mt-1">{game.genre}</p>
        </div>
      )}

      {/* Players */}
      {game.players && (
        <div>
          <p className="text-pixel text-[10px] text-wood-brown uppercase">Players</p>
          <p className="text-pixel text-sm text-ocean-dark mt-1">
            {game.players === 1 ? '1 Player' : `1-${game.players} Players`}
          </p>
        </div>
      )}

      {/* Release Date */}
      {game.releaseDate && (
        <div>
          <p className="text-pixel text-[10px] text-wood-brown uppercase">Release Year</p>
          <p className="text-pixel text-sm text-ocean-dark mt-1">
            {new Date(game.releaseDate).getFullYear()}
          </p>
        </div>
      )}

      {/* System */}
      <div>
        <p className="text-pixel text-[10px] text-wood-brown uppercase">System</p>
        <p className="text-pixel text-sm text-ocean-dark mt-1 uppercase">{game.system}</p>
      </div>

      {/* Rating */}
      {game.rating && (
        <div>
          <p className="text-pixel text-[10px] text-wood-brown uppercase">Rating</p>
          <p className="text-pixel text-sm text-ocean-dark mt-1">{game.rating}/10</p>
        </div>
      )}

      {/* Description */}
      {game.description && (
        <div>
          <p className="text-pixel text-[10px] text-wood-brown uppercase">Description</p>
          <p className="text-pixel text-xs text-ocean-dark mt-1 leading-relaxed">
            {game.description}
          </p>
        </div>
      )}
    </div>
  );
}
