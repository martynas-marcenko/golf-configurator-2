import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { currentClubs, selectedClubs, actions } from '../hooks/useGolfState';
import { cn } from '../lib/utils';

export function ClubGrid() {
  const isClubSelected = (club) => {
    return selectedClubs.value.some(c => c.id === club.id);
  };

  const handleClubToggle = (club) => {
    const success = actions.toggleClub(club);
    if (!success) {
      // Show toast for minimum clubs requirement
      // This would trigger the toast system
      console.log('⚠️ Cannot modify required clubs below minimum');
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {currentClubs.value.map((club) => {
        const isSelected = isClubSelected(club);
        const isRequired = club.isRequired;
        const isOptional = club.isOptional;
        
        return (
          <Card 
            key={club.id} 
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-md',
              isSelected && 'ring-2 ring-primary ring-offset-2',
              isOptional && 'border-dashed border-primary/30'
            )}
            onClick={() => handleClubToggle(club)}
          >
            <CardContent className="p-3 text-center">
              <div className="space-y-2">
                {/* Club Icon/Type Indicator */}
                <div className={cn(
                  'w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white font-bold',
                  isSelected ? 'bg-primary' : 'bg-muted',
                  club.type === 'driver' && 'bg-blue-500',
                  club.type === 'wood' && 'bg-green-500', 
                  club.type === 'iron' && 'bg-gray-500',
                  club.type === 'wedge' && 'bg-orange-500',
                  club.type === 'putter' && 'bg-purple-500'
                )}>
                  {club.name.charAt(0)}
                </div>

                {/* Club Name */}
                <div className="font-medium text-sm">{club.name}</div>

                {/* Club Type Badge */}
                <div className={cn(
                  'text-xs px-2 py-1 rounded-full',
                  isRequired ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                )}>
                  {isRequired ? 'Required' : 'Optional'}
                </div>

                {/* Selection Status */}
                {isSelected && (
                  <div className="text-xs text-primary font-medium">
                    ✓ Selected
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}