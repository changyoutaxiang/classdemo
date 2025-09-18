'use client';

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Coffee, Clock, Palette, Maximize2, Minimize2 } from 'lucide-react';
import { usePomodoro, PomodoroStyle } from '@/hooks/usePomodoro';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface PomodoroTimerProps {
  className?: string;
  enableFullscreen?: boolean;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ className, enableFullscreen = true }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const {
    timeLeft,
    isRunning,
    isBreak,
    sessions,
    currentStyle,
    start,
    pause,
    reset,
    skipToBreak,
    skipToWork,
    setStyle,
    getProgress,
    formatTime,
  } = usePomodoro();

  const styles = {
    dopamine: {
      name: '多巴胺',
      gradient: 'from-orange-400 via-pink-500 to-purple-600',
      textColor: 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500',
      buttonGradient: 'bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600',
      bgGradient: 'bg-gradient-to-br from-orange-400/20 via-pink-500/20 to-purple-600/20',
    },
    apple: {
      name: '极简',
      gradient: 'from-gray-600 to-gray-800',
      textColor: 'text-gray-800',
      buttonGradient: 'bg-gray-800 hover:bg-gray-900',
      bgGradient: 'bg-gradient-to-br from-gray-100 to-gray-200',
    },
    candy: {
      name: '糖果',
      gradient: 'from-pink-300 via-purple-300 to-indigo-300',
      textColor: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400',
      buttonGradient: 'bg-gradient-to-r from-pink-300 to-purple-300 hover:from-pink-400 hover:to-purple-400',
      bgGradient: 'bg-gradient-to-br from-pink-200/30 via-purple-200/30 to-indigo-200/30',
    },
  };

  const currentStyleConfig = styles[currentStyle];

  const handleStyleChange = (style: PomodoroStyle) => {
    setStyle(style);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // Enter fullscreen mode
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
      }
    } else {
      // Exit fullscreen mode
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Handle fullscreen change event
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const progress = getProgress();
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // 非全屏状态：只显示调起按钮
  if (!isFullscreen) {
    return (
      <div className={`${className} flex items-center justify-center p-4`}>
        <Button
          onClick={toggleFullscreen}
          size="lg"
          className={`${currentStyleConfig.buttonGradient} text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-4`}
        >
          <Clock className="w-5 h-5 mr-2" />
          开始专注
        </Button>
      </div>
    );
  }

  // 全屏状态：显示完整番茄钟界面
  return (
    <div className={`${className} ${currentStyleConfig.bgGradient} fixed inset-0 flex flex-col items-center justify-center z-50 backdrop-blur-sm transition-all duration-500`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 w-full max-w-md">
        <h3 className={`text-lg font-semibold ${currentStyleConfig.textColor}`}>
          {isBreak ? '🧘 休息时间' : '⏰ 专注时间'}
        </h3>
        
        <div className="flex items-center space-x-2">
          {/* Fullscreen Toggle */}
          <Button
            onClick={toggleFullscreen}
            variant="ghost"
            size="sm"
            className="hover:bg-white/20"
            title="退出全屏"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          
          {/* Style Selector */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-white/20"
              >
                <Palette className="w-4 h-4 mr-1" />
                {styles[currentStyle].name}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                {Object.entries(styles).map(([key, style]) => (
                  <button
                    key={key}
                    onClick={() => handleStyleChange(key as PomodoroStyle)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      currentStyle === key
                        ? 'bg-gray-100 dark:bg-gray-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${style.gradient}`} />
                      <span className="text-sm">{style.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Timer Circle */}
      <div className={`relative mx-auto mb-6 ${isFullscreen ? 'w-96 h-96' : 'w-64 h-64'}`}>
        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 240 240">
          <circle
            cx="120"
            cy="120"
            r="110"
            stroke="currentColor"
            strokeWidth={isFullscreen ? '12' : '8'}
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="120"
            cy="120"
            r="110"
            stroke="currentColor"
            strokeWidth={isFullscreen ? '12' : '8'}
            fill="none"
            strokeDasharray={2 * Math.PI * 110}
            strokeDashoffset={2 * Math.PI * 110 - (progress / 100) * 2 * Math.PI * 110}
            strokeLinecap="round"
            className={`text-gradient-to-r ${currentStyleConfig.gradient} transition-all duration-1000`}
            style={{
              filter: isFullscreen 
                ? 'drop-shadow(0 0 20px rgba(255, 165, 0, 0.8))' 
                : 'drop-shadow(0 0 10px rgba(255, 165, 0, 0.5))',
            }}
          />
        </svg>
        
        {/* Centered time using inline styles for guaranteed centering */}
        <div 
          className="absolute pointer-events-none"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0,
            padding: 0
          }}
        >
          <div 
            className={`font-bold font-mono ${currentStyleConfig.textColor} ${isFullscreen ? 'text-6xl' : 'text-4xl'} tabular-nums`}
            style={{
              textAlign: 'center',
              lineHeight: 1,
              margin: 0,
              padding: 0,
              whiteSpace: 'nowrap'
            }}
          >
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Session counter positioned below */}
        <div className={`absolute left-1/2 bottom-0 -translate-x-1/2 ${isFullscreen ? 'translate-y-[-60px] text-lg' : 'translate-y-[-40px] text-sm'} text-muted-foreground pointer-events-none`}>
          {sessions} 个番茄钟
        </div>

        {/* Fullscreen hint text further below */}
        {isFullscreen && (
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[-20px] text-sm text-muted-foreground pointer-events-none">
            {isBreak ? '好好休息一下吧 ☕' : '保持专注！💪'}
          </div>
        )}

        {/* Enhanced pulsing effect for running state */}
        {isRunning && (
          <div 
            className={`absolute inset-0 rounded-full bg-gradient-to-r ${currentStyleConfig.gradient} opacity-20 animate-pulse`}
            style={{ 
              filter: isFullscreen 
                ? 'blur(30px) drop-shadow(0 0 30px rgba(255, 165, 0, 0.5))' 
                : 'blur(20px)' 
            }}
          />
        )}
      </div>

      {/* Control Buttons */}
      <div className={`flex items-center justify-center space-x-3 ${isFullscreen ? 'space-x-6' : ''}`}>
        <Button
          onClick={isRunning ? pause : start}
          size="lg"
          className={`${currentStyleConfig.buttonGradient} text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${isFullscreen ? 'px-8 py-6 text-lg' : ''}`}
        >
          {isRunning ? (
            <Pause className={`${isFullscreen ? 'w-6 h-6' : 'w-5 h-5'} mr-2`} />
          ) : (
            <Play className={`${isFullscreen ? 'w-6 h-6' : 'w-5 h-5'} mr-2`} />
          )}
          {isRunning ? '暂停' : '开始'}
        </Button>

        <Button
          onClick={reset}
          size="lg"
          variant="outline"
          className={`border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 ${isFullscreen ? 'px-6 py-6 text-lg' : ''}`}
        >
          <RotateCcw className={isFullscreen ? 'w-6 h-6' : 'w-5 h-5'} />
        </Button>

        <Button
          onClick={isBreak ? skipToWork : skipToBreak}
          size="lg"
          variant="outline"
          className={`border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 ${isFullscreen ? 'px-6 py-6 text-lg' : ''}`}
        >
          {isBreak ? (
            <Clock className={isFullscreen ? 'w-6 h-6' : 'w-5 h-5'} />
          ) : (
            <Coffee className={isFullscreen ? 'w-6 h-6' : 'w-5 h-5'} />
          )}
        </Button>
      </div>

      {/* Quick Info */}
      <div className="mt-4 text-center">
        <div className="text-sm text-muted-foreground">
          {isBreak ? '好好休息一下 ☕' : '保持专注！💪'}
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;