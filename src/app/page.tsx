'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/moving-border';
import { MessageCircle, FileText, CheckSquare, Clock, FolderKanban, X } from 'lucide-react';
import { Component as TextAnimation } from '@/components/ui/text-animation';

import WarpShaderHero from '@/components/ui/wrap-shader';

export default function HomePage() {
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25分钟，以秒为单位
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 计时器效果
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // 时间到了
      if (timeLeft === 0 && isRunning) {
        setIsRunning(false);
        if (!isBreak) {
          // 工作时间结束，开始休息
          setTimeLeft(5 * 60); // 5分钟休息
          setIsBreak(true);
          alert('🎉 专注时间结束！休息5分钟吧～');
        } else {
          // 休息时间结束
          setTimeLeft(25 * 60); // 重置为25分钟
          setIsBreak(false);
          alert('⏰ 休息结束！准备开始新的专注时间');
        }
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, isBreak]);

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 番茄钟控制函数
  const startPomodoro = () => setIsRunning(true);
  const pausePomodoro = () => setIsRunning(false);
  const resetPomodoro = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
  };

  // 奥运五环样式的功能配置 - 标准间距布局
  const olympicRings = [
    {
      title: 'AI 对话',
      icon: MessageCircle,
      href: '/chat',
      gradient: 'from-blue-500 to-cyan-500',
      ringColor: 'ring-blue-500',
      bgGradient: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      position: 'left-[5%] top-[15%]',
      zIndex: 'z-30',
      animation: 'animate-pulse',
      delay: 'animation-delay-0',
    },
    {
      title: 'AI 笔记',
      icon: FileText,
      href: '/notes',
      gradient: 'from-yellow-500 to-amber-500',
      ringColor: 'ring-yellow-500',
      bgGradient: 'bg-gradient-to-r from-yellow-500 to-amber-500',
      position: 'left-[35%] top-[15%]',
      zIndex: 'z-20',
      animation: 'animate-pulse',
      delay: 'animation-delay-200',
    },
    {
      title: '待办清单',
      icon: CheckSquare,
      href: '/todos',
      gradient: 'from-black to-gray-700',
      ringColor: 'ring-gray-800',
      bgGradient: 'bg-gradient-to-r from-black to-gray-700',
      position: 'left-[65%] top-[15%]',
      zIndex: 'z-30',
      animation: 'animate-pulse',
      delay: 'animation-delay-400',
    },
    {
      title: '项目管理',
      icon: FolderKanban,
      href: '/projects',
      gradient: 'from-green-500 to-emerald-500',
      ringColor: 'ring-green-500',
      bgGradient: 'bg-gradient-to-r from-green-500 to-emerald-500',
      position: 'left-[20%] top-[50%]',
      zIndex: 'z-40',
      animation: 'animate-pulse',
      delay: 'animation-delay-600',
    },
    {
      title: '番茄钟',
      icon: Clock,
      href: '#',
      onClick: () => setShowPomodoro(true),
      gradient: 'from-red-500 to-pink-500',
      ringColor: 'ring-red-500',
      bgGradient: 'bg-gradient-to-r from-red-500 to-pink-500',
      position: 'left-[50%] top-[50%]',
      zIndex: 'z-40',
      animation: 'animate-pulse',
      delay: 'animation-delay-800',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Warp Shader Background */}
      <div className="absolute inset-0">
        <WarpShaderHero />
      </div>

      {/* 番茄钟弹窗 */}
      {showPomodoro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-in fade-in-50 zoom-in-95">
            <button
              onClick={() => setShowPomodoro(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold mb-2">
                {isBreak ? '🌱 休息时间' : '🍅 专注时间'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {isBreak ? '放松一下，准备下轮专注' : '专心工作，避免分心'}
              </p>

              <div className={`text-6xl font-mono font-bold mb-8 transition-colors ${
                isRunning ? 'text-green-600' : isBreak ? 'text-blue-600' : 'text-gray-800 dark:text-gray-200'
              }`}>
                {formatTime(timeLeft)}
              </div>

              <div className="flex gap-4 justify-center">
                {!isRunning ? (
                  <button
                    onClick={startPomodoro}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isBreak ? '开始休息' : '开始专注'}
                  </button>
                ) : (
                  <button
                    onClick={pausePomodoro}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    暂停
                  </button>
                )}
                <button
                  onClick={resetPomodoro}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  重置
                </button>
              </div>

              <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                🍅 专注工作 • 🎵 音效提醒 • 🎨 多巴胺风格
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
        {/* Header */}
        <div className="text-center mb-24">
          <div className="h-32 flex items-center justify-center">
            <TextAnimation />
          </div>
        </div>

        {/* Olympic Rings Layout */}
        <div className="relative w-[900px] h-[450px] mx-auto">
          <style jsx>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            @keyframes fadeInScale {
              0% {
                opacity: 0;
                transform: scale(0.5) rotate(-180deg);
              }
              100% {
                opacity: 1;
                transform: scale(1) rotate(0deg);
              }
            }
            .ring-animation-0 { animation: fadeInScale 0.8s ease-out, float 3s ease-in-out 0.8s infinite; }
            .ring-animation-1 { animation: fadeInScale 0.8s ease-out 0.1s, float 3s ease-in-out 0.9s infinite; }
            .ring-animation-2 { animation: fadeInScale 0.8s ease-out 0.2s, float 3s ease-in-out 1s infinite; }
            .ring-animation-3 { animation: fadeInScale 0.8s ease-out 0.3s, float 3s ease-in-out 1.1s infinite; }
            .ring-animation-4 { animation: fadeInScale 0.8s ease-out 0.4s, float 3s ease-in-out 1.2s infinite; }
          `}</style>
          {olympicRings.map((ring, index) => (
            <div
              key={ring.title}
              className={`absolute ${ring.position} ${ring.zIndex} ring-animation-${index}`}
              style={{
                opacity: 0,
                animation: `fadeInScale 0.8s ease-out ${index * 0.1}s forwards, float 3s ease-in-out ${0.8 + index * 0.1}s infinite`
              }}
            >
              {ring.onClick ? (
                <button
                  onClick={ring.onClick}
                  className="group relative transform transition-all duration-300 hover:scale-125 hover:rotate-6"
                >
                  {/* 圆环外圈 */}
                  <div className={`w-36 h-36 rounded-full border-[16px] border-transparent ${ring.bgGradient} p-[16px] shadow-lg group-hover:shadow-2xl transition-all duration-300`}>
                    {/* 内圈白色背景 */}
                    <div className="w-full h-full rounded-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md flex items-center justify-center group-hover:bg-white dark:group-hover:bg-gray-900 transition-colors duration-300">
                      <ring.icon className="h-14 w-14 text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  {/* Hover 提示 */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-sm px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-xl">
                    {ring.title}
                  </div>
                </button>
              ) : (
                <Link href={ring.href} className="group relative block transform transition-all duration-300 hover:scale-125 hover:rotate-6">
                  {/* 圆环外圈 */}
                  <div className={`w-36 h-36 rounded-full border-[16px] border-transparent ${ring.bgGradient} p-[16px] shadow-lg group-hover:shadow-2xl transition-all duration-300`}>
                    {/* 内圈白色背景 */}
                    <div className="w-full h-full rounded-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md flex items-center justify-center group-hover:bg-white dark:group-hover:bg-gray-900 transition-colors duration-300">
                      <ring.icon className="h-14 w-14 text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  {/* Hover 提示 */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-sm px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-xl">
                    {ring.title}
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* 底部说明 */}
        <div className="mt-24 text-center space-y-2">
          <p className="text-gray-600 dark:text-gray-400 text-sm animate-pulse">
            🏅 点击圆环进入功能 • 悬停查看名称 🏅
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-xs">
            极简五环界面 • 奥运精神 • 追求卓越
          </p>
        </div>
      </div>
    </div>
  );
}