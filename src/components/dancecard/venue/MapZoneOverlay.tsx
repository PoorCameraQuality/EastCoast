'use client'

import { cn } from '@/lib/cn'
import { normalizeMapZonePin, type MapZonePin } from '@/lib/dancecard/mapPinZones'

export function MapZoneOverlay({
  pin,
  displayName,
  variant,
  focused = false,
  highlighted = false,
  className,
  onClick,
  onPointerDown,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
  ...rest
}: {
  pin: MapZonePin
  displayName: string
  variant: 'view' | 'drop' | 'edit'
  focused?: boolean
  highlighted?: boolean
  className?: string
  onClick?: () => void
  onPointerDown?: (e: React.PointerEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  children?: React.ReactNode
} & Omit<React.HTMLAttributes<HTMLElement>, 'onClick' | 'onPointerDown' | 'onDragOver' | 'onDragLeave' | 'onDrop'>) {
  const z = normalizeMapZonePin(pin)
  const wPct = (z.width ?? 0.12) * 100
  const hPct = (z.height ?? 0.12) * 100
  const rotation = z.rotation ?? 0

  const isDrop = variant === 'drop'
  const isEdit = variant === 'edit'
  const active = focused || highlighted

  const fillTone = active
    ? 'rgba(42, 40, 38, 0.62)'
    : highlighted
      ? 'rgba(36, 34, 32, 0.58)'
      : 'rgba(28, 26, 24, 0.52)'

  const shell = cn(
    'absolute flex items-center justify-center overflow-visible transition-[transform,box-shadow,border-color] duration-150',
    z.shape === 'circle' && 'rounded-full',
    z.shape === 'square' && 'rounded-sm',
    z.shape === 'rectangle' && 'rounded-md',
    z.shape === 'triangle' && 'rounded-none',
    isEdit && 'cursor-grab active:cursor-grabbing',
    className,
  )

  const zoneStyle: React.CSSProperties = {
    left: `${z.x * 100}%`,
    top: `${z.y * 100}%`,
    width: `${wPct}%`,
    height: `${hPct}%`,
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    transformOrigin: 'center center',
  }

  const fillClip =
    z.shape === 'triangle'
      ? { clipPath: 'polygon(50% 4%, 4% 96%, 96% 96%)' as const }
      : undefined

  const fillClass = cn(
    'pointer-events-none absolute inset-0 border-2 border-dashed',
    z.shape === 'circle' && 'rounded-full',
    z.shape === 'square' && 'rounded-sm',
    z.shape === 'rectangle' && 'rounded-md',
    active
      ? 'border-dc-warning shadow-[0_0_0_2px_rgba(232,200,122,0.35),0_4px_16px_rgba(0,0,0,0.55),0_0_20px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)]'
      : 'border-white/75 shadow-[0_3px_14px_rgba(0,0,0,0.55),0_0_16px_rgba(20,18,16,0.65),inset_0_1px_0_rgba(255,255,255,0.1)]',
  )

  const Tag = onClick || onPointerDown ? 'button' : 'div'

  return (
    <Tag
      type={Tag === 'button' ? 'button' : undefined}
      className={shell}
      style={zoneStyle}
      title={displayName}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      {...rest}
    >
      <span
        className={fillClass}
        style={{ backgroundColor: fillTone, ...fillClip }}
        aria-hidden
      />

      {/* Centered in zone; pill may extend past dashed border. Counter-rotated so text stays level. */}
      <span
        className="pointer-events-none relative z-[1] flex max-w-none flex-col items-center justify-center gap-0.5 px-0.5"
        style={rotation ? { transform: `rotate(${-rotation}deg)` } : undefined}
      >
        <span
          className={cn(
            'whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-semibold leading-snug shadow-lg backdrop-blur-sm',
            active
              ? 'border-dc-warning/60 bg-black/85 text-dc-warning'
              : 'border-white/20 bg-black/85 text-dc-text',
          )}
        >
          {displayName}
        </span>
        {isDrop ? (
          <span className="whitespace-nowrap rounded border border-white/15 bg-black/75 px-1.5 py-px text-[9px] font-medium text-dc-text-muted">
            Drop here
          </span>
        ) : null}
      </span>

      {children}
    </Tag>
  )
}
