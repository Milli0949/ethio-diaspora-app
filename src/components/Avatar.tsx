import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface AvatarProps {
  name: string;
  src?: string | null;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  verified?: boolean;
  protectedMedia?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-10 h-10 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-20 h-20 text-2xl',
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  color = '#e11d48',
  size = 'md',
  verified = false,
  protectedMedia = true,
}) => {
  const initial = (name || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="relative inline-flex shrink-0">
      <div
        onContextMenu={(e) => {
          if (protectedMedia) e.preventDefault();
        }}
        className={`${SIZE_CLASSES[size]} rounded-full overflow-hidden flex items-center justify-center font-semibold text-white select-none ${
          protectedMedia ? 'protected-media' : ''
        }`}
        style={{ backgroundColor: src ? undefined : color }}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            draggable={false}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>
      {verified && (
        <span
          title="Verified"
          className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-700"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        </span>
      )}
    </div>
  );
};
