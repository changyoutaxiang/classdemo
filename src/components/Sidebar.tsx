import React from 'react';
import { FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  onToggleSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onToggleSettings }) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Button 
        variant="ghost" 
        size="icon" 
        className="w-10 h-10"
        title="笔记"
      >
        <FileText className="w-5 h-5" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="w-10 h-10"
        onClick={onToggleSettings}
        title="设置"
      >
        <Settings className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default Sidebar;