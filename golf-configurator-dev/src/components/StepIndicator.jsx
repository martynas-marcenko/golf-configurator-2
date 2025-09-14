/**
 * Step Indicator Component
 * Pure UI component for displaying configuration steps following DRY architecture
 */

import { Check } from 'lucide-react';
import { CONFIGURATOR_STEPS } from '../constants/defaults';
import { cn } from '../lib/utils';

export function StepIndicator({ currentStep, maxUnlockedStep, onStepClick }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      {CONFIGURATOR_STEPS.map((step, index) => (
        <div key={step.name} className="flex items-center">
          <button
            className={cn(
              'relative h-12 w-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200',
              index <= maxUnlockedStep ? 'cursor-pointer hover:opacity-75' : 'cursor-not-allowed opacity-50'
            )}
            disabled={index > maxUnlockedStep}
            onClick={() => onStepClick(index)}
          >
            <div
              className={cn(
                'absolute inset-0 rounded-full transition-all duration-200',
                index === currentStep
                  ? 'bg-black scale-110'
                  : index < currentStep
                  ? 'bg-black'
                  : index <= maxUnlockedStep
                  ? 'bg-muted'
                  : 'bg-muted/50'
              )}
            />
            <span
              className={cn(
                'relative z-10 transition-colors duration-200',
                index === currentStep
                  ? 'text-white'
                  : index < currentStep
                  ? 'text-white'
                  : index <= maxUnlockedStep
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/50'
              )}
            >
              {index < currentStep ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={cn(
                'absolute -bottom-6 text-xs font-medium transition-colors duration-200 whitespace-nowrap',
                index === currentStep
                  ? 'text-black'
                  : index < currentStep
                  ? 'text-muted-foreground'
                  : index <= maxUnlockedStep
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/50'
              )}
            >
              {step.name}
            </span>
          </button>
          {index < CONFIGURATOR_STEPS.length - 1 && <div className="mx-4 h-px w-8 bg-border" />}
        </div>
      ))}
    </div>
  );
}