'use client';

import { useState } from 'react';
import { SUPPORTED_MODELS, getModelById, formatPrice, formatContextWindow } from '@/lib/models';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
  className?: string;
}

export function ModelSelector({ value, onChange, className }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedModel = getModelById(value);

  const recommendedModels = SUPPORTED_MODELS.filter(m => m.isRecommended);
  const otherModels = SUPPORTED_MODELS.filter(m => !m.isRecommended);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-8 px-3 text-sm font-normal',
            className
          )}
        >
          <div className="flex items-center gap-2">
            {selectedModel?.isRecommended && (
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
            )}
            <span className="truncate max-w-32">
              {selectedModel?.name || '选择模型'}
            </span>
          </div>
          <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-80">
        <div className="p-2">
          <div className="text-sm font-medium mb-2">推荐模型</div>
          {recommendedModels.map((model) => (
            <DropdownMenuItem
              key={model.id}
              onSelect={() => {
                onChange(model.id);
                setOpen(false);
              }}
              className="flex items-start gap-3 py-3 cursor-pointer"
            >
              <div className="mt-0.5">
                {value === model.id ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <div className="h-4 w-4" />
                )}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{model.name}</span>
                  {model.isRecommended && (
                    <Badge variant="secondary" className="text-xs">
                      推荐
                    </Badge>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {model.description}
                </div>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatPrice(model.inputPrice)}</span>
                  <span>•</span>
                  <span>{formatContextWindow(model.contextWindow)}</span>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>

        {otherModels.length > 0 && (
          <>
            <div className="border-t my-2" />
            <div className="p-2">
              <div className="text-sm font-medium mb-2">其他模型</div>
              {otherModels.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onSelect={() => {
                    onChange(model.id);
                    setOpen(false);
                  }}
                  className="flex items-start gap-3 py-3 cursor-pointer"
                >
                  <div className="mt-0.5">
                    {value === model.id ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="font-medium text-sm">{model.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {model.description}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatPrice(model.inputPrice)}</span>
                      <span>•</span>
                      <span>{formatContextWindow(model.contextWindow)}</span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}