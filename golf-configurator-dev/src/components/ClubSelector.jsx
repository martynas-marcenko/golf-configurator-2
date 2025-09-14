/**
 * Club Selector Component
 * Pure UI component for selecting golf clubs following DRY architecture
 */

import { Check } from 'lucide-react';
import { Tooltip } from './ui/tooltip';
import { IRON_NUMBERS } from '../constants/defaults';
import { isClubSelected, isClubLocked } from '../utils/validation';
import { cn } from '../lib/utils';

export function ClubSelector({ selectedClubs, onClubToggle }) {
  return (
    <div>
      <h2 className="mb-3 text-base font-bold text-foreground">Select Clubs</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Choose your ideal iron set. 6-PW are included by default.
      </p>
      <div className="mb-4">
        <span className="text-sm text-muted-foreground">
          {selectedClubs.length} {selectedClubs.length === 1 ? 'club' : 'clubs'} selected
        </span>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {IRON_NUMBERS.map((iron) => (
          <Tooltip
            key={iron}
            content={isClubLocked(iron) ? 'Required club - included in all sets' : null}
          >
            <button
              onClick={() => onClubToggle(iron)}
              className={cn(
                'group relative h-16 w-full rounded-lg border-2 transition-all duration-200 ease-in-out',
                'flex flex-col items-center justify-center text-base font-semibold',
                'hover:shadow-lg hover:-translate-y-1',
                isClubLocked(iron)
                  ? 'border-black bg-black/10 shadow-md shadow-black/20 cursor-default'
                  : isClubSelected(iron, selectedClubs)
                  ? 'border-black bg-black/10 shadow-md shadow-black/20'
                  : 'border-border bg-card hover:border-muted-foreground hover:bg-muted'
              )}
              disabled={isClubLocked(iron)}
            >
              <span
                className={cn(
                  'transition-colors duration-200 mb-1',
                  isClubSelected(iron, selectedClubs) ? 'text-black' : 'text-card-foreground group-hover:text-foreground'
                )}
              >
                {iron === 'P' ? 'PW' : `${iron}`}
              </span>

              <div
                className={cn(
                  'absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-200',
                  isClubSelected(iron, selectedClubs) ? 'bg-black scale-100 opacity-100' : 'bg-muted scale-0 opacity-0'
                )}
              >
                {isClubSelected(iron, selectedClubs) && (
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                )}
              </div>

              {isClubSelected(iron, selectedClubs) && (
                <div className="absolute inset-0 rounded-lg bg-black/5 ring-1 ring-black/20" />
              )}
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}