"use client";

import { createAvatar } from "@dicebear/core";
import { adventurer } from "@dicebear/collection";

function makeSrc(seed: string): string {
  try {
    return createAvatar(adventurer, {
      seed,
      backgroundColor: ['transparent'],
    }).toDataUri();
  }
  catch { return ''; }
}

export default function AvatarImg({ seed, name = '?', color = '#E85D2F', size = 40, borderRadius = '50%', style }: {
  seed: string; name?: string; color?: string; size?: number;
  borderRadius?: string | number; style?: React.CSSProperties;
}) {
  const src = makeSrc(seed);

  return (
    <div style={{
      width: size, height: size, borderRadius, overflow: 'hidden', flexShrink: 0,
      border: `1.5px solid ${color}40`,
      background: 'rgba(255,255,255,0.07)',
      ...style
    }}>
      {src
        ? <img src={src} alt="" style={{ width: '100%', height: '100%' }} draggable={false} />
        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: size * 0.38, fontWeight: 800, color }}>
            {name[0]?.toUpperCase()}
          </div>
      }
    </div>
  );
}
