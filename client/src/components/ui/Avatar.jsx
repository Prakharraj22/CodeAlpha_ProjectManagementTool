import React from 'react';

function getInitials(name = '') {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function stringToColor(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ['#7c6ef6','#22d3ee','#34d399','#fbbf24','#fb7185','#a78bfa','#60a5fa','#f97316'];
  return colors[Math.abs(hash) % colors.length];
}

export default function Avatar({ src, name = '', size = 'md', className = '', style = {}, title: titleProp }) {
  const sizeClass = `avatar avatar-${size}`;
  const label = titleProp || name;

  if (src) {
    return (
      <img
        src={src}
        alt={label || 'User'}
        title={label}
        className={`${sizeClass} ${className}`}
        style={style}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${className}`}
      style={{ background: stringToColor(name), color: '#fff', ...style }}
      title={label}
      aria-label={label}
    >
      {getInitials(name)}
    </div>
  );
}

export function AvatarStack({ users = [], max = 4, size = 'sm' }) {
  const visible = users.slice(0, max);
  const rest = users.length - max;
  return (
    <div className="avatar-stack">
      {visible.map((u, i) => (
        <Avatar key={u.id || u.user_id || i} src={u.avatar} name={u.name} size={size} title={u.name} />
      ))}
      {rest > 0 && (
        <div
          className={`avatar avatar-${size}`}
          style={{ background: 'var(--surface-4)', color: 'var(--text-2)', border: '2px solid var(--surface-2)' }}
        >
          +{rest}
        </div>
      )}
    </div>
  );
}
