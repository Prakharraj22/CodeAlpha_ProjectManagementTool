import React from 'react';

export default function Skeleton({ width, height, className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="project-card" style={{ cursor: 'default', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Skeleton width="55%" height={16} style={{ marginBottom: 8 }} />
          <Skeleton width="80%" height={12} />
        </div>
      </div>
      <Skeleton width="100%" height={10} style={{ marginBottom: 8 }} />
      <Skeleton width="70%" height={10} />
      <div style={{ marginTop: 8 }}>
        <Skeleton width="100%" height={5} style={{ borderRadius: 999 }} />
      </div>
    </div>
  );
}

export function SkeletonTaskCard() {
  return (
    <div className="task-card" style={{ marginBottom: 8, cursor: 'default' }}>
      <Skeleton width={60} height={18} style={{ marginBottom: 10, borderRadius: 999 }} />
      <Skeleton width="100%" height={14} style={{ marginBottom: 6 }} />
      <Skeleton width="70%" height={12} style={{ marginBottom: 12 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width={70} height={10} />
        <Skeleton width={24} height={24} style={{ borderRadius: '50%' }} />
      </div>
    </div>
  );
}
