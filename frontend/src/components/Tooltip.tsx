import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { ReactNode } from 'react';

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
}

export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  delayDuration = 200,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            className="
              z-50
              max-w-xs
              px-3 py-2
              text-pixel text-xs
              text-skull-white
              bg-ocean-dark
              border-2 border-pirate-gold
              shadow-lg
              animate-in fade-in-0 zoom-in-95
              data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
              data-[side=bottom]:slide-in-from-top-2
              data-[side=left]:slide-in-from-right-2
              data-[side=right]:slide-in-from-left-2
              data-[side=top]:slide-in-from-bottom-2
            "
            sideOffset={5}
          >
            {typeof content === 'string' ? (
              <p className="leading-relaxed">{content}</p>
            ) : (
              content
            )}
            <TooltipPrimitive.Arrow className="fill-pirate-gold" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

/**
 * InfoIcon component - A question mark icon for tooltips
 */
export function InfoIcon({ className = '' }: { className?: string }) {
  return (
    <span
      className={`
        inline-flex items-center justify-center
        w-4 h-4
        text-pixel text-xs
        text-pirate-gold
        border border-pirate-gold
        rounded-full
        cursor-help
        hover:bg-pirate-gold/20
        ${className}
      `}
      aria-label="More information"
    >
      ?
    </span>
  );
}
