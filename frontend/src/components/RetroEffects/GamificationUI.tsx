import { useState, useEffect } from 'react';
import './GamificationUI.css';
import { Sounds } from '../../utils/soundSystem';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface PlayerStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  gamesPlayed: number;
  totalPlayTime: number; // in minutes
  achievementsUnlocked: number;
  totalAchievements: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// ============================================
// LEVEL DISPLAY COMPONENT
// ============================================

interface LevelDisplayProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
  showAnimation?: boolean;
  className?: string;
}

export function LevelDisplay({ level, xp, xpToNextLevel, showAnimation = false, className = '' }: LevelDisplayProps) {
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(level);

  const progress = (xp / xpToNextLevel) * 100;

  useEffect(() => {
    if (showAnimation && level > prevLevel) {
      setIsLevelingUp(true);
      Sounds.LEVEL_UP();
      setTimeout(() => {
        setIsLevelingUp(false);
        setPrevLevel(level);
      }, 2000);
    }
  }, [level, prevLevel, showAnimation]);

  return (
    <div className={`level-display ${isLevelingUp ? 'level-up-animation' : ''} ${className}`}>
      <div className="level-display__badge">
        <div className="level-display__badge-icon">⚓</div>
        <div className="level-display__badge-number">{level}</div>
      </div>
      <div className="level-display__info">
        <div className="level-display__title">
          CAPTAIN LVL {level}
        </div>
        <div className="level-display__progress-container">
          <div className="level-display__progress-bar">
            <div
              className="level-display__progress-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
            <div className="level-display__progress-shine" />
          </div>
          <div className="level-display__progress-text">
            {xp} / {xpToNextLevel} XP
          </div>
        </div>
      </div>
      {isLevelingUp && (
        <div className="level-display__level-up-overlay">
          <div className="level-display__level-up-text">
            ⭐ LEVEL UP! ⭐
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// COIN COUNTER COMPONENT
// ============================================

interface CoinCounterProps {
  coins: number;
  showAnimation?: boolean;
  className?: string;
}

export function CoinCounter({ coins, showAnimation = false, className = '' }: CoinCounterProps) {
  const [displayCoins, setDisplayCoins] = useState(coins);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (showAnimation && coins !== displayCoins) {
      setIsAnimating(true);

      // Animate the counter
      const diff = coins - displayCoins;
      const steps = 20;
      const increment = diff / steps;
      let current = displayCoins;

      const interval = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= coins) || (increment < 0 && current <= coins)) {
          setDisplayCoins(coins);
          clearInterval(interval);
          setIsAnimating(false);
        } else {
          setDisplayCoins(Math.round(current));
        }
      }, 30);

      Sounds.COIN();

      return () => clearInterval(interval);
    } else {
      setDisplayCoins(coins);
    }
  }, [coins, displayCoins, showAnimation]);

  return (
    <div className={`coin-counter ${isAnimating ? 'coin-counter--animating' : ''} ${className}`}>
      <div className="coin-counter__icon">🪙</div>
      <div className="coin-counter__amount">{displayCoins.toLocaleString()}</div>
      <div className="coin-counter__label">GOLD</div>
    </div>
  );
}

// ============================================
// ACHIEVEMENT CARD COMPONENT
// ============================================

interface AchievementCardProps {
  achievement: Achievement;
  onClick?: () => void;
  className?: string;
}

export function AchievementCard({ achievement, onClick, className = '' }: AchievementCardProps) {
  const rarityColors = {
    common: '#9CA3AF',
    rare: '#60A5FA',
    epic: '#A855F7',
    legendary: '#F59E0B',
  };

  return (
    <div
      className={`achievement-card ${achievement.unlocked ? 'achievement-card--unlocked' : 'achievement-card--locked'} achievement-card--${achievement.rarity} ${className}`}
      onClick={onClick}
      style={{ '--rarity-color': rarityColors[achievement.rarity] } as React.CSSProperties}
    >
      <div className="achievement-card__icon">{achievement.icon}</div>
      <div className="achievement-card__content">
        <div className="achievement-card__title">{achievement.title}</div>
        <div className="achievement-card__description">{achievement.description}</div>
        {achievement.unlocked && achievement.unlockedAt && (
          <div className="achievement-card__unlocked-date">
            Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
          </div>
        )}
      </div>
      {!achievement.unlocked && (
        <div className="achievement-card__lock-overlay">
          <div className="achievement-card__lock-icon">🔒</div>
        </div>
      )}
      {achievement.unlocked && (
        <div className="achievement-card__checkmark">✓</div>
      )}
    </div>
  );
}

// ============================================
// ACHIEVEMENTS PANEL COMPONENT
// ============================================

interface AchievementsPanelProps {
  achievements: Achievement[];
  onAchievementClick?: (achievement: Achievement) => void;
  className?: string;
}

export function AchievementsPanel({ achievements, onAchievementClick, className = '' }: AchievementsPanelProps) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [rarityFilter, setRarityFilter] = useState<Achievement['rarity'] | 'all'>('all');

  const filteredAchievements = achievements.filter((achievement) => {
    if (filter === 'unlocked' && !achievement.unlocked) return false;
    if (filter === 'locked' && achievement.unlocked) return false;
    if (rarityFilter !== 'all' && achievement.rarity !== rarityFilter) return false;
    return true;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const progress = (unlockedCount / achievements.length) * 100;

  return (
    <div className={`achievements-panel ${className}`}>
      <div className="achievements-panel__header">
        <h2 className="achievements-panel__title">🏆 ACHIEVEMENTS</h2>
        <div className="achievements-panel__stats">
          <span className="achievements-panel__count">
            {unlockedCount} / {achievements.length}
          </span>
          <div className="achievements-panel__progress">
            <div
              className="achievements-panel__progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="achievements-panel__filters">
        <div className="achievements-panel__filter-group">
          <button
            className={`achievements-panel__filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => {
              setFilter('all');
              Sounds.MENU_NAVIGATE();
            }}
          >
            ALL
          </button>
          <button
            className={`achievements-panel__filter-button ${filter === 'unlocked' ? 'active' : ''}`}
            onClick={() => {
              setFilter('unlocked');
              Sounds.MENU_NAVIGATE();
            }}
          >
            UNLOCKED
          </button>
          <button
            className={`achievements-panel__filter-button ${filter === 'locked' ? 'active' : ''}`}
            onClick={() => {
              setFilter('locked');
              Sounds.MENU_NAVIGATE();
            }}
          >
            LOCKED
          </button>
        </div>

        <div className="achievements-panel__filter-group">
          <button
            className={`achievements-panel__rarity-button ${rarityFilter === 'all' ? 'active' : ''}`}
            onClick={() => {
              setRarityFilter('all');
              Sounds.MENU_NAVIGATE();
            }}
          >
            ALL
          </button>
          <button
            className={`achievements-panel__rarity-button achievements-panel__rarity-button--common ${rarityFilter === 'common' ? 'active' : ''}`}
            onClick={() => {
              setRarityFilter('common');
              Sounds.MENU_NAVIGATE();
            }}
          >
            COMMON
          </button>
          <button
            className={`achievements-panel__rarity-button achievements-panel__rarity-button--rare ${rarityFilter === 'rare' ? 'active' : ''}`}
            onClick={() => {
              setRarityFilter('rare');
              Sounds.MENU_NAVIGATE();
            }}
          >
            RARE
          </button>
          <button
            className={`achievements-panel__rarity-button achievements-panel__rarity-button--epic ${rarityFilter === 'epic' ? 'active' : ''}`}
            onClick={() => {
              setRarityFilter('epic');
              Sounds.MENU_NAVIGATE();
            }}
          >
            EPIC
          </button>
          <button
            className={`achievements-panel__rarity-button achievements-panel__rarity-button--legendary ${rarityFilter === 'legendary' ? 'active' : ''}`}
            onClick={() => {
              setRarityFilter('legendary');
              Sounds.MENU_NAVIGATE();
            }}
          >
            LEGENDARY
          </button>
        </div>
      </div>

      <div className="achievements-panel__grid">
        {filteredAchievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            onClick={() => {
              onAchievementClick?.(achievement);
              Sounds.MENU_SELECT();
            }}
          />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="achievements-panel__empty">
          <div className="achievements-panel__empty-icon">🗺️</div>
          <div className="achievements-panel__empty-text">No achievements found</div>
        </div>
      )}
    </div>
  );
}

// ============================================
// STATS CARD COMPONENT
// ============================================

interface StatsCardProps {
  stats: PlayerStats;
  className?: string;
}

export function StatsCard({ stats, className = '' }: StatsCardProps) {
  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className={`stats-card ${className}`}>
      <h3 className="stats-card__title">📊 PIRATE STATS</h3>
      <div className="stats-card__grid">
        <div className="stats-card__stat">
          <div className="stats-card__stat-icon">🎮</div>
          <div className="stats-card__stat-value">{stats.gamesPlayed}</div>
          <div className="stats-card__stat-label">Games Played</div>
        </div>
        <div className="stats-card__stat">
          <div className="stats-card__stat-icon">⏱️</div>
          <div className="stats-card__stat-value">{formatPlayTime(stats.totalPlayTime)}</div>
          <div className="stats-card__stat-label">Play Time</div>
        </div>
        <div className="stats-card__stat">
          <div className="stats-card__stat-icon">🏆</div>
          <div className="stats-card__stat-value">
            {stats.achievementsUnlocked} / {stats.totalAchievements}
          </div>
          <div className="stats-card__stat-label">Achievements</div>
        </div>
        <div className="stats-card__stat">
          <div className="stats-card__stat-icon">🪙</div>
          <div className="stats-card__stat-value">{stats.coins.toLocaleString()}</div>
          <div className="stats-card__stat-label">Gold Collected</div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PROGRESS BAR COMPONENT
// ============================================

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'gold' | 'red' | 'purple';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function ProgressBar({
  value,
  max,
  label,
  showPercentage = true,
  color = 'blue',
  size = 'medium',
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`progress-bar progress-bar--${color} progress-bar--${size} ${className}`}>
      {label && <div className="progress-bar__label">{label}</div>}
      <div className="progress-bar__container">
        <div className="progress-bar__track">
          <div
            className="progress-bar__fill"
            style={{ width: `${percentage}%` }}
          >
            <div className="progress-bar__shine" />
          </div>
        </div>
        {showPercentage && (
          <div className="progress-bar__text">
            {value} / {max}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// XP GAIN NOTIFICATION COMPONENT
// ============================================

interface XPGainNotificationProps {
  amount: number;
  reason: string;
  onComplete?: () => void;
}

export function XPGainNotification({ amount, reason, onComplete }: XPGainNotificationProps) {
  useEffect(() => {
    Sounds.POWER_UP();
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="xp-gain-notification">
      <div className="xp-gain-notification__icon">⭐</div>
      <div className="xp-gain-notification__content">
        <div className="xp-gain-notification__amount">+{amount} XP</div>
        <div className="xp-gain-notification__reason">{reason}</div>
      </div>
    </div>
  );
}

// ============================================
// ACHIEVEMENT UNLOCK NOTIFICATION COMPONENT
// ============================================

interface AchievementUnlockNotificationProps {
  achievement: Achievement;
  onComplete?: () => void;
}

export function AchievementUnlockNotification({ achievement, onComplete }: AchievementUnlockNotificationProps) {
  useEffect(() => {
    Sounds.ACHIEVEMENT();
    const timer = setTimeout(() => {
      onComplete?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const rarityColors = {
    common: '#9CA3AF',
    rare: '#60A5FA',
    epic: '#A855F7',
    legendary: '#F59E0B',
  };

  return (
    <div
      className={`achievement-unlock-notification achievement-unlock-notification--${achievement.rarity}`}
      style={{ '--rarity-color': rarityColors[achievement.rarity] } as React.CSSProperties}
    >
      <div className="achievement-unlock-notification__header">
        🏆 ACHIEVEMENT UNLOCKED! 🏆
      </div>
      <div className="achievement-unlock-notification__body">
        <div className="achievement-unlock-notification__icon">{achievement.icon}</div>
        <div className="achievement-unlock-notification__content">
          <div className="achievement-unlock-notification__title">{achievement.title}</div>
          <div className="achievement-unlock-notification__description">{achievement.description}</div>
          <div className="achievement-unlock-notification__rarity">
            {achievement.rarity.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
