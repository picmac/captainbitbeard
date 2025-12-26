/**
 * Retro Effects Components
 * Authentic retro gaming visual and audio effects
 */

export {
  CRTOverlay,
  VHSGlitch,
  TVStatic,
  ScreenBurn,
  RGBSplitText,
  usePowerAnimation,
} from './CRTOverlay';

export {
  PixelButton,
  TreasureChestButton,
  CannonButton,
  ShipButton,
  SkullButton,
} from './PixelButton';

export type { default as RetroSoundSystem } from '../../utils/soundSystem';
export { soundSystem, Sounds } from '../../utils/soundSystem';

export {
  useRetroSound,
  useButtonSound,
  useMenuSounds,
  useGameSounds,
  useKeyboardSounds,
  useHoverSound,
} from '../../hooks/useRetroSound';

export {
  OceanWaves,
  FloatingClouds,
  PirateShip,
  FallingCoins,
  StarrySky,
  PirateScene,
} from './PixelBackground';

export {
  PixelAvatarGenerator,
  PixelAvatar,
  type AvatarConfig,
} from './PixelAvatarGenerator';

export {
  LevelDisplay,
  CoinCounter,
  AchievementCard,
  AchievementsPanel,
  StatsCard,
  ProgressBar,
  XPGainNotification,
  AchievementUnlockNotification,
  type PlayerStats,
  type Achievement,
} from './GamificationUI';

export {
  TreasureMapLibrary,
  type MapGame,
} from './TreasureMapLibrary';

export {
  PageTransition,
  PixelDissolveTransition,
  TVStaticTransition,
  ScanlineWipeTransition,
  GlitchTransition,
  RouteTransition,
  usePageTransition,
  useRouteTransition,
  type TransitionType,
} from './PageTransitions';

export {
  useKonamiCode,
  useKeySequence,
  useEasterEggs,
  FallingCoinsEffect,
  MatrixRainEffect,
  RainbowModeEffect,
  PirateShipBattleEffect,
  DebugModeIndicator,
  SecretMessage,
  EasterEggNotification,
  KonamiCodeProgress,
  type EasterEgg,
  type KonamiCodeCallback,
} from './EasterEggs';

export {
  NotificationProvider,
  ToastContainer,
  useNotifications,
  useToast,
  toast,
  type Notification,
  type NotificationType,
} from './NotificationSystem';
