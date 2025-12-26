import { useRef, useEffect, useState, useCallback } from 'react';
import './TreasureMapLibrary.css';
import { Sounds } from '../../utils/soundSystem';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface MapGame {
  id: string;
  title: string;
  system: string;
  coverUrl?: string;
  position: { x: number; y: number }; // Position on map (0-1 normalized)
  status: 'locked' | 'available' | 'playing' | 'completed';
  completionPercentage?: number;
}

export interface TreasureMapLibraryProps {
  games: MapGame[];
  onGameClick?: (game: MapGame) => void;
  className?: string;
}

interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;
const ZOOM_SPEED = 0.1;

// ============================================
// TREASURE MAP LIBRARY COMPONENT
// ============================================

export function TreasureMapLibrary({ games, onGameClick, className = '' }: TreasureMapLibraryProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, zoom: 1 });
  const [hoveredGame, setHoveredGame] = useState<MapGame | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showMinimap, setShowMinimap] = useState(true);

  // Map dimensions (virtual space)
  const MAP_WIDTH = 2000;
  const MAP_HEIGHT = 1500;

  // ============================================
  // MAP RENDERING
  // ============================================

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Save context state
    ctx.save();

    // Apply viewport transform
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.zoom, viewport.zoom);

    // Draw ocean background
    const gradient = ctx.createLinearGradient(0, 0, 0, MAP_HEIGHT);
    gradient.addColorStop(0, '#1E40AF');
    gradient.addColorStop(0.5, '#1E3A8A');
    gradient.addColorStop(1, '#1E293B');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Draw water waves (animated)
    drawWaves(ctx);

    // Draw islands/decorations
    drawIslands(ctx);

    // Draw game markers
    games.forEach((game) => {
      drawGameMarker(ctx, game, game === hoveredGame);
    });

    // Draw compass rose
    drawCompass(ctx);

    // Draw sea creatures
    drawSeaCreatures(ctx);

    // Restore context state
    ctx.restore();
  }, [viewport, games, hoveredGame]);

  const drawWaves = (ctx: CanvasRenderingContext2D) => {
    const time = Date.now() * 0.001;
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.lineWidth = 2;

    for (let y = 100; y < MAP_HEIGHT; y += 100) {
      ctx.beginPath();
      for (let x = 0; x <= MAP_WIDTH; x += 10) {
        const waveY = y + Math.sin((x + time * 50) * 0.01) * 10 + Math.sin((x + time * 30) * 0.005) * 5;
        if (x === 0) {
          ctx.moveTo(x, waveY);
        } else {
          ctx.lineTo(x, waveY);
        }
      }
      ctx.stroke();
    }
  };

  const drawIslands = (ctx: CanvasRenderingContext2D) => {
    const islands = [
      { x: 300, y: 400, size: 120 },
      { x: 800, y: 600, size: 150 },
      { x: 1400, y: 300, size: 100 },
      { x: 1600, y: 900, size: 130 },
      { x: 500, y: 1100, size: 90 },
    ];

    islands.forEach((island) => {
      // Island base (sand)
      ctx.fillStyle = '#D2B48C';
      ctx.beginPath();
      ctx.ellipse(island.x, island.y, island.size, island.size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Island shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(island.x + 5, island.y + island.size * 0.5, island.size * 0.8, island.size * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Palm trees
      const treeX = island.x - island.size * 0.3;
      const treeY = island.y - island.size * 0.2;

      // Trunk
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(treeX - 4, treeY, 8, 40);

      // Leaves
      ctx.fillStyle = '#228B22';
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const leafX = treeX + Math.cos(angle) * 20;
        const leafY = treeY - 10 + Math.sin(angle) * 20;
        ctx.beginPath();
        ctx.ellipse(leafX, leafY, 15, 8, angle, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  };

  const drawGameMarker = (ctx: CanvasRenderingContext2D, game: MapGame, isHovered: boolean) => {
    const x = game.position.x * MAP_WIDTH;
    const y = game.position.y * MAP_HEIGHT;
    const size = isHovered ? 50 : 40;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 5, y + size + 5, size * 0.6, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Marker icon based on status
    if (game.status === 'locked') {
      // Locked treasure chest
      drawTreasureChest(ctx, x, y, size, true);
    } else if (game.status === 'available') {
      // Available treasure chest
      drawTreasureChest(ctx, x, y, size, false);
    } else if (game.status === 'playing') {
      // Ship marker
      drawShip(ctx, x, y, size);
    } else if (game.status === 'completed') {
      // Skull and crossbones
      drawSkull(ctx, x, y, size);
    }

    // Hover glow effect
    if (isHovered) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Completion badge
    if (game.completionPercentage && game.completionPercentage > 0) {
      drawCompletionBadge(ctx, x + size * 0.5, y - size * 0.5, game.completionPercentage);
    }
  };

  const drawTreasureChest = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, locked: boolean) => {
    const chestWidth = size;
    const chestHeight = size * 0.8;

    // Chest body
    ctx.fillStyle = locked ? '#654321' : '#DAA520';
    ctx.fillRect(x - chestWidth / 2, y - chestHeight / 2, chestWidth, chestHeight);

    // Chest lid
    ctx.fillStyle = locked ? '#8B4513' : '#FFD700';
    ctx.fillRect(x - chestWidth / 2, y - chestHeight / 2 - size * 0.2, chestWidth, size * 0.3);

    // Lock
    if (locked) {
      ctx.fillStyle = '#2C2C2C';
      ctx.fillRect(x - size * 0.15, y - size * 0.1, size * 0.3, size * 0.25);
      ctx.beginPath();
      ctx.arc(x, y - size * 0.15, size * 0.12, Math.PI, 0, true);
      ctx.fill();
    } else {
      // Gold shine
      ctx.fillStyle = '#FFF';
      ctx.fillRect(x - size * 0.1, y - size * 0.2, size * 0.05, size * 0.4);
    }

    // Chest bands
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - chestWidth / 2, y - chestHeight / 2, chestWidth, chestHeight);
    ctx.beginPath();
    ctx.moveTo(x - chestWidth / 2, y);
    ctx.lineTo(x + chestWidth / 2, y);
    ctx.stroke();
  };

  const drawShip = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    const time = Date.now() * 0.001;
    const bob = Math.sin(time * 2) * 5;

    // Ship body
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(x - size * 0.6, y + bob);
    ctx.lineTo(x + size * 0.6, y + bob);
    ctx.lineTo(x + size * 0.4, y + size * 0.4 + bob);
    ctx.lineTo(x - size * 0.4, y + size * 0.4 + bob);
    ctx.closePath();
    ctx.fill();

    // Mast
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + bob);
    ctx.lineTo(x, y - size * 0.8 + bob);
    ctx.stroke();

    // Sail
    ctx.fillStyle = '#F5F5DC';
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.8 + bob);
    ctx.lineTo(x + size * 0.5, y - size * 0.4 + bob);
    ctx.lineTo(x, y + bob);
    ctx.closePath();
    ctx.fill();

    // Flag
    ctx.fillStyle = '#DC143C';
    ctx.fillRect(x, y - size * 0.8 + bob, size * 0.3, size * 0.15);
  };

  const drawSkull = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    // Skull
    ctx.fillStyle = '#E8E8E8';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - size * 0.15, y - size * 0.1, size * 0.1, 0, Math.PI * 2);
    ctx.arc(x + size * 0.15, y - size * 0.1, size * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size * 0.05, y + size * 0.1);
    ctx.lineTo(x + size * 0.05, y + size * 0.1);
    ctx.closePath();
    ctx.fill();

    // Crossbones
    ctx.strokeStyle = '#E8E8E8';
    ctx.lineWidth = size * 0.1;
    ctx.lineCap = 'round';

    // Bone 1
    ctx.beginPath();
    ctx.moveTo(x - size * 0.5, y + size * 0.4);
    ctx.lineTo(x + size * 0.5, y + size * 0.6);
    ctx.stroke();

    // Bone 2
    ctx.beginPath();
    ctx.moveTo(x - size * 0.5, y + size * 0.6);
    ctx.lineTo(x + size * 0.5, y + size * 0.4);
    ctx.stroke();
  };

  const drawCompletionBadge = (ctx: CanvasRenderingContext2D, x: number, y: number, percentage: number) => {
    const radius = 15;

    // Badge background
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Badge border
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Percentage text
    ctx.fillStyle = '#FFF';
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(percentage)}%`, x, y);
  };

  const drawCompass = (ctx: CanvasRenderingContext2D) => {
    const x = MAP_WIDTH - 150;
    const y = 150;
    const radius = 60;

    // Compass background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Compass directions
    const directions = ['N', 'E', 'S', 'W'];
    const angles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];

    ctx.fillStyle = '#000';
    ctx.font = '16px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    directions.forEach((dir, i) => {
      const angle = angles[i] - Math.PI / 2;
      const dirX = x + Math.cos(angle) * (radius - 20);
      const dirY = y + Math.sin(angle) * (radius - 20);

      if (dir === 'N') {
        ctx.fillStyle = '#DC143C';
      } else {
        ctx.fillStyle = '#000';
      }

      ctx.fillText(dir, dirX, dirY);
    });

    // Compass needle
    ctx.strokeStyle = '#DC143C';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y - radius * 0.6);
    ctx.lineTo(x, y + radius * 0.6);
    ctx.stroke();
  };

  const drawSeaCreatures = (ctx: CanvasRenderingContext2D) => {
    const time = Date.now() * 0.001;

    // Whale
    const whaleX = 200 + Math.sin(time * 0.5) * 100;
    const whaleY = 800;

    ctx.fillStyle = '#4B5563';
    ctx.beginPath();
    ctx.ellipse(whaleX, whaleY, 80, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // Whale tail
    ctx.beginPath();
    ctx.moveTo(whaleX - 80, whaleY);
    ctx.lineTo(whaleX - 100, whaleY - 20);
    ctx.lineTo(whaleX - 100, whaleY + 20);
    ctx.closePath();
    ctx.fill();

    // Water spout
    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(whaleX + 20, whaleY - 30);
    ctx.lineTo(whaleX + 20, whaleY - 60);
    ctx.stroke();

    // Octopus
    const octopusX = 1200 + Math.cos(time * 0.3) * 50;
    const octopusY = 1000;

    ctx.fillStyle = '#7C3AED';
    ctx.beginPath();
    ctx.arc(octopusX, octopusY, 30, 0, Math.PI * 2);
    ctx.fill();

    // Tentacles
    ctx.strokeStyle = '#7C3AED';
    ctx.lineWidth = 5;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const wave = Math.sin(time * 3 + i) * 10;
      ctx.beginPath();
      ctx.moveTo(octopusX, octopusY);
      ctx.quadraticCurveTo(
        octopusX + Math.cos(angle) * 30,
        octopusY + Math.sin(angle) * 30 + wave,
        octopusX + Math.cos(angle) * 50,
        octopusY + Math.sin(angle) * 50 + wave
      );
      ctx.stroke();
    }
  };

  // ============================================
  // INTERACTION HANDLERS
  // ============================================

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - viewport.x) / viewport.zoom;
    const mouseY = (e.clientY - rect.top - viewport.y) / viewport.zoom;

    if (isDragging) {
      setViewport((prev) => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    } else {
      // Check for game hover
      const hovered = games.find((game) => {
        const gameX = game.position.x * MAP_WIDTH;
        const gameY = game.position.y * MAP_HEIGHT;
        const distance = Math.sqrt(Math.pow(mouseX - gameX, 2) + Math.pow(mouseY - gameY, 2));
        return distance < 40;
      });

      if (hovered !== hoveredGame) {
        setHoveredGame(hovered || null);
        if (hovered) {
          Sounds.MENU_NAVIGATE();
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!isDragging && hoveredGame) {
      onGameClick?.(hoveredGame);
      Sounds.MENU_SELECT();
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED;
    setViewport((prev) => ({
      ...prev,
      zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.zoom + delta)),
    }));
  };

  // ============================================
  // ZOOM CONTROLS
  // ============================================

  const zoomIn = () => {
    setViewport((prev) => ({
      ...prev,
      zoom: Math.min(MAX_ZOOM, prev.zoom + ZOOM_SPEED),
    }));
    Sounds.MENU_NAVIGATE();
  };

  const zoomOut = () => {
    setViewport((prev) => ({
      ...prev,
      zoom: Math.max(MIN_ZOOM, prev.zoom - ZOOM_SPEED),
    }));
    Sounds.MENU_NAVIGATE();
  };

  const resetView = () => {
    setViewport({ x: 0, y: 0, zoom: 1 });
    Sounds.MENU_SELECT();
  };

  // ============================================
  // CANVAS SETUP AND ANIMATION
  // ============================================

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      drawMap();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawMap]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div ref={containerRef} className={`treasure-map-library ${className}`}>
      <canvas
        ref={canvasRef}
        className="treasure-map-library__canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      {/* Controls */}
      <div className="treasure-map-library__controls">
        <button onClick={zoomIn} className="treasure-map-library__control-button" title="Zoom In">
          🔍+
        </button>
        <button onClick={zoomOut} className="treasure-map-library__control-button" title="Zoom Out">
          🔍-
        </button>
        <button onClick={resetView} className="treasure-map-library__control-button" title="Reset View">
          🧭
        </button>
        <button
          onClick={() => {
            setShowMinimap(!showMinimap);
            Sounds.MENU_NAVIGATE();
          }}
          className="treasure-map-library__control-button"
          title="Toggle Minimap"
        >
          🗺️
        </button>
      </div>

      {/* Game Info Tooltip */}
      {hoveredGame && (
        <div className="treasure-map-library__tooltip">
          <div className="treasure-map-library__tooltip-title">{hoveredGame.title}</div>
          <div className="treasure-map-library__tooltip-system">{hoveredGame.system}</div>
          <div className="treasure-map-library__tooltip-status">
            {hoveredGame.status === 'locked' && '🔒 Locked'}
            {hoveredGame.status === 'available' && '✨ Available'}
            {hoveredGame.status === 'playing' && '⚓ Currently Playing'}
            {hoveredGame.status === 'completed' && '💀 Completed'}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="treasure-map-library__legend">
        <div className="treasure-map-library__legend-title">LEGEND</div>
        <div className="treasure-map-library__legend-item">
          <span className="treasure-map-library__legend-icon">🔒</span>
          <span className="treasure-map-library__legend-label">Locked</span>
        </div>
        <div className="treasure-map-library__legend-item">
          <span className="treasure-map-library__legend-icon">💰</span>
          <span className="treasure-map-library__legend-label">Available</span>
        </div>
        <div className="treasure-map-library__legend-item">
          <span className="treasure-map-library__legend-icon">⛵</span>
          <span className="treasure-map-library__legend-label">Playing</span>
        </div>
        <div className="treasure-map-library__legend-item">
          <span className="treasure-map-library__legend-icon">💀</span>
          <span className="treasure-map-library__legend-label">Completed</span>
        </div>
      </div>

      {/* Minimap */}
      {showMinimap && (
        <div className="treasure-map-library__minimap">
          <div
            className="treasure-map-library__minimap-viewport"
            style={{
              left: `${(-viewport.x / MAP_WIDTH) * 100}%`,
              top: `${(-viewport.y / MAP_HEIGHT) * 100}%`,
              width: `${(100 / viewport.zoom)}%`,
              height: `${(100 / viewport.zoom)}%`,
            }}
          />
          {games.map((game) => (
            <div
              key={game.id}
              className={`treasure-map-library__minimap-marker treasure-map-library__minimap-marker--${game.status}`}
              style={{
                left: `${game.position.x * 100}%`,
                top: `${game.position.y * 100}%`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
