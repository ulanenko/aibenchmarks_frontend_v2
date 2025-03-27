'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { StrategyFormDialog, FormMode } from '@/app/strategies/components/strategy-form-dialog';
import { useBenchmarkStore } from '@/stores/use-benchmark-store';
import { useToast } from '@/hooks/use-toast';

interface BenchmarkStrategyButtonProps {
  className?: string;
}

export function BenchmarkStrategyButton({ className = '' }: BenchmarkStrategyButtonProps) {
  const { benchmark } = useBenchmarkStore();
  const { toast } = useToast();
  
  // Handle what happens after strategy is applied
  const handleStrategyComplete = () => {
    toast({
      title: 'Strategy Updated',
      description: 'Accept/Reject criteria have been updated successfully',
    });
  };
  
  return (
    <StrategyFormDialog 
      mode={FormMode.BENCHMARK}
      strategy={benchmark?.strategy ?? null}
      onComplete={handleStrategyComplete}
      trigger={
        <Button 
          variant="default" 
          size="sm" 
          className={`bg-primary hover:bg-primary/90 ${className}`}
        >
          <Settings className="mr-2 h-4 w-4" />
          Set Accept/Reject Criteria
        </Button>
      }
    />
  );
} 