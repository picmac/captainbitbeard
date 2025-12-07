/// <reference types="vite/client" />

// Extend ScreenOrientation interface to include lock method
interface ScreenOrientation extends EventTarget {
  lock(orientation: OrientationLockType): Promise<void>;
  unlock(): void;
}
