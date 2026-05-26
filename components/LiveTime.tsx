'use client';
import { useState, useEffect } from 'react';

export function LiveTime() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString('en-GB', {
          timeZone: 'Europe/London',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: '1.5rem',
        letterSpacing: '-0.04rem',
        fontWeight: 700,
        color: '#FFF',
      }}
    >
      {time}
    </p>
  );
}
