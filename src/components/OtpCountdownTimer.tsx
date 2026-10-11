'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface OtpCountdownTimerProps {
  expiresAt: string;
  onExpire?: () => void;
  className?: string;
}

export const OtpCountdownTimer: React.FC<OtpCountdownTimerProps> = ({
  expiresAt,
  onExpire,
  className = '',
}) => {
  const calculateRemaining = useCallback(() => {
    const target = new Date(expiresAt).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((target - now) / 1000));
  }, [expiresAt]);

  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const target = new Date(expiresAt).getTime();
    const now = Date.now();
    return isNaN(target) ? 300 : Math.max(0, Math.floor((target - now) / 1000));
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateRemaining, onExpire]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLowTime = secondsRemaining <= 60;
  const isExpiring = secondsRemaining <= 30;

  // Percentage of 5 minutes (300 seconds)
  const percentage = Math.max(0, Math.min(100, (secondsRemaining / 300) * 100));

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex items-center gap-2">
        <Clock
          className={`w-4 h-4 ${
            isExpiring
              ? 'text-rose-400 animate-bounce'
              : isLowTime
              ? 'text-amber-400 animate-pulse'
              : 'text-amber-400'
          }`}
        />
        <span
          className={`font-mono font-bold text-lg tracking-wider ${
            isExpiring
              ? 'text-rose-400 animate-pulse'
              : isLowTime
              ? 'text-amber-400'
              : 'text-zinc-100'
          }`}
        >
          {formattedTime}
        </span>
      </div>

      {/* Mini Progress Bar (Solid Multi-Color) */}
      <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 rounded-full ${
            isExpiring
              ? 'bg-rose-500'
              : isLowTime
              ? 'bg-amber-400'
              : 'bg-emerald-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isLowTime && secondsRemaining > 0 && (
        <span className="text-[10px] text-amber-400/90 flex items-center gap-1 mt-1 font-medium">
          <AlertTriangle className="w-3 h-3" />
          Expiring soon
        </span>
      )}

      {secondsRemaining === 0 && (
        <span className="text-[10px] text-rose-400 font-semibold mt-1">
          Reservation window closed
        </span>
      )}
    </div>
  );
};
