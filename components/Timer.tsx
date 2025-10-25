
import React, { useState, useEffect } from 'react';

interface TimerProps {
  initialSeconds: number;
  onTimeUp: () => void;
  onTick?: (seconds: number) => void;
}

const Timer: React.FC<TimerProps> = ({ initialSeconds, onTimeUp, onTick }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      onTimeUp();
      return;
    }

    const intervalId = setInterval(() => {
      setSeconds(prev => {
          const newSeconds = prev - 1;
          if (onTick) {
              onTick(newSeconds);
          }
          return newSeconds;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [seconds, onTimeUp, onTick]);

  const formatTime = () => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const timeColorClass = seconds < 60 ? 'text-red-500' : 'text-white';

  return (
    <div className={`text-5xl font-mono font-bold ${timeColorClass}`}>
      {formatTime()}
    </div>
  );
};

export default Timer;
