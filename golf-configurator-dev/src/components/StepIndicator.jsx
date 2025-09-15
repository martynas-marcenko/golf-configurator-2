/**
 * Step Indicator Component
 * Pure UI component for displaying configuration steps following DRY architecture
 */

import { CONFIGURATOR_STEPS } from '../constants/defaults';
import { cn } from '../lib/utils';

export function StepIndicator({ currentStep, maxUnlockedStep, onStepClick }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      {CONFIGURATOR_STEPS.map((step, index) => (
        <div key={step.name} className="flex items-center">
          <div className="flex items-center">
            <button
              className={cn(
                'flex items-center transition-all duration-200',
                index <= maxUnlockedStep ? 'cursor-pointer hover:opacity-75' : 'cursor-not-allowed opacity-50'
              )}
              onClick={() => onStepClick(index)}
              disabled={index > maxUnlockedStep}
            >
              {index <= currentStep ? (
                <div className="mr-2 h-5 w-5 rounded-full bg-black flex items-center justify-center">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ) : (
                <div
                  className={cn(
                    'mr-2 h-5 w-5 rounded-full flex items-center justify-center',
                    index <= maxUnlockedStep ? 'bg-muted' : 'bg-muted/50'
                  )}
                >
                  <svg
                    className={cn(
                      'h-3 w-3',
                      index <= maxUnlockedStep ? 'text-muted-foreground' : 'text-muted-foreground/50'
                    )}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
              <span
                className={cn(
                  'text-base font-medium transition-colors duration-200',
                  index === currentStep
                    ? 'text-black'
                    : index <= maxUnlockedStep
                    ? 'text-muted-foreground hover:text-foreground'
                    : 'text-muted-foreground/50'
                )}
              >
                {step.name}
              </span>
            </button>
          </div>
          {index < CONFIGURATOR_STEPS.length - 1 && <div className="mx-4 h-px w-8 bg-border" />}
        </div>
      ))}
    </div>
  );
}