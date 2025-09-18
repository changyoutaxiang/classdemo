import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStoredApiKey, setStoredApiKey } from '@/lib/api';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setIsSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    setStoredApiKey(apiKey);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>设置</CardTitle>
          <CardDescription>配置您的OpenRouter API密钥</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">API密钥</label>
            <Input
              type="password"
              placeholder="sk-or-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              您的API密钥将安全地存储在浏览器本地存储中
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSave}
              disabled={!apiKey.trim()}
            >
              {isSaved ? '已保存' : '保存'}
            </Button>
            <Button 
              variant="outline"
              onClick={onClose}
            >
              取消
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;