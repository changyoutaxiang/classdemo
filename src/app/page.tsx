'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

import HolographicCard from '@/components/ui/holographic-card';
import { Button } from '@/components/ui/moving-border';
import { MessageCircle, FileText, CheckSquare, Clock, ArrowRight, FolderKanban, X } from 'lucide-react';
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

  const features = [
    {
      title: 'AI 对话',
      description: '与多个AI模型进行智能对话，支持流式响应和提示词模板',
      icon: MessageCircle,
      href: '/chat',
      color: 'from-blue-500 to-cyan-500',
      features: ['多模型支持', '流式响应', '提示词模板', '对话历史'],
    },
    {
      title: 'AI 笔记',
      description: '智能笔记应用，支持AI自动生成标题、标签和内容优化',
      icon: FileText,
      href: '/notes',
      color: 'from-purple-500 to-pink-500',
      features: ['AI标题生成', '智能标签', '内容优化', 'Markdown支持'],
    },
    {
      title: '待办清单',
      description: '智能待办事项管理，支持AI任务分解和优先级排序',
      icon: CheckSquare,
      href: '/todos',
      color: 'from-green-500 to-emerald-500',
      features: ['任务分解', '智能排序', '进度跟踪', '提醒功能'],
    },
    {
      title: '项目管理',
      description: '专业项目管理工具，支持看板视图、任务分配和进度追踪',
      icon: FolderKanban,
      href: '/projects',
      color: 'from-indigo-500 to-blue-500',
      features: ['看板视图', '任务分配', '进度追踪', '团队协作'],
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Warp Shader Background */}
      <div className="absolute inset-0">
        <WarpShaderHero />
      </div>

      {/* 番茄钟浮动按钮 */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={() => setShowPomodoro(true)}
          className="group relative w-14 h-14 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <Clock className="h-6 w-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            番茄钟
          </div>
        </button>
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
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-3">
            <div className="h-64 flex items-center justify-center">
              <TextAnimation />
            </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {features.slice(0, 4).map((feature) => (
            <HolographicCard key={feature.title} className="group hover:shadow-lg transition-all duration-300">
              <div className="pb-3 md:pb-4">
                <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg bg-gradient-to-r ${feature.color} mb-2 md:mb-4 flex items-center justify-center`}>
                  <feature.icon className="h-4 w-4 md:h-6 md:w-6 text-white" />
                </div>
                <h3 className="text-sm md:text-xl font-semibold leading-tight">{feature.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 text-xs md:text-sm mt-1 md:mt-1.5 line-clamp-2 md:line-clamp-none">
                  {feature.description}
                </p>
              </div>
              
              <div>
                <div className="space-y-1 md:space-y-2 mb-2 md:mb-4">
                  {feature.features.slice(0, 2).map((item) => (
                    <div key={item} className="flex items-center text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-current mr-1.5 md:mr-2 flex-shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                  {/* 隐藏的特性列表，仅在桌面端显示 */}
                  <div className="hidden md:block space-y-2">
                    {feature.features.slice(2).map((item) => (
                      <div key={item} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-current mr-2 flex-shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Link href={feature.href}>
                  <Button className="w-full text-xs md:text-sm py-1.5 md:py-2" variant="default" size="sm">
                    <span className="md:hidden">使用</span>
                    <span className="hidden md:inline">开始使用</span>
                    <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </Link>
              </div>
            </HolographicCard>
          ))}
        </div>
        

        </div>
      </div>
    </div>
  );
}