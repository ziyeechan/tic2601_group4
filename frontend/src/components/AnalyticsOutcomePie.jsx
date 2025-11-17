import React from 'react';

export function AnalyticsOutcomePie({
  completed,
  noShow,
  cancelled,
  totalBookings,
  completedPct,
  noShowPct,
  cancelledPct
}) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: 160, height: 160, borderRadius: '50%',
          background: `conic-gradient(#10b981 0 ${completedPct}%,
                                       #ef4444 ${completedPct}% ${completedPct + noShowPct}%,
                                       #f59e0b ${completedPct + noShowPct}% 100%)`,
        }}
        title={`Completed ${completed} • No-show ${noShow} • Cancelled ${cancelled}`}
      />
      <div style={{ fontSize: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 10, height: 10, background: '#10b981', display: 'inline-block', borderRadius: 2 }} />
          <span>Completed: <b>{completed}</b> ({completedPct.toFixed(2)}%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 10, height: 10, background: '#ef4444', display: 'inline-block', borderRadius: 2 }} />
          <span>No-Show: <b>{noShow}</b> ({noShowPct.toFixed(2)}%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, background: '#f59e0b', display: 'inline-block', borderRadius: 2 }} />
          <span>Cancelled: <b>{cancelled}</b> ({cancelledPct.toFixed(2)}%)</span>
        </div>
        <div className="text-muted" style={{ marginTop: 8 }}>Total bookings: {totalBookings}</div>
      </div>
    </div>
  );
}
