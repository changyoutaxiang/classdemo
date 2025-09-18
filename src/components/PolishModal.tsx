import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PolishModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalContent: string;
  polishedContent: string;
  onAccept: () => void;
}

const PolishModal: React.FC<PolishModalProps> = ({
  isOpen,
  onClose,
  originalContent,
  polishedContent,
  onAccept,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] md:w-full">
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg">内容润色对比</DialogTitle>
          <DialogDescription className="text-sm">
            查看AI润色后的内容，选择是否接受修改
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 my-3 md:my-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">原文</h4>
            <div className="border rounded-md p-3 md:p-4 h-48 md:h-96 overflow-y-auto bg-muted/20">
              <pre className="whitespace-pre-wrap text-xs md:text-sm leading-relaxed">{originalContent}</pre>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">润色后</h4>
            <div className="border rounded-md p-3 md:p-4 h-48 md:h-96 overflow-y-auto bg-primary/5">
              <pre className="whitespace-pre-wrap text-xs md:text-sm leading-relaxed">{polishedContent}</pre>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col md:flex-row gap-2 md:gap-0">
          <Button variant="outline" onClick={onClose} className="w-full md:w-auto">
            取消
          </Button>
          <Button onClick={onAccept} className="w-full md:w-auto">
            接受修改
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PolishModal;