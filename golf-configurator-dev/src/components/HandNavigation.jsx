import { useState, useEffect } from 'preact/hooks';
import { getProductHandAndVariations, getHandVariationUrl } from '../utils/dataAttributes';
import { HAND_OPTIONS } from '../constants/defaults';
import { cn } from '../lib/utils';

/**
 * HandNavigation Component
 * Handles navigation between left and right-handed product variations
 * Uses product metafields to determine current hand and available variations
 */
export function HandNavigation() {
  const [currentHand, setCurrentHand] = useState('Right Handed');
  const [handLinks, setHandLinks] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const { currentHand: hand, handLinks: links } = getProductHandAndVariations();
      setCurrentHand(hand);
      setHandLinks(links);
    } catch (error) {
      console.error('Failed to load product hand data:', error);
      // Fallback to default state
      setCurrentHand('Right Handed');
      setHandLinks({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className='mb-6'>
        <h2 className='mb-3 text-base font-bold text-foreground'>Hand Preference</h2>
        <div className='grid grid-cols-2 gap-4'>
          <div className='h-12 bg-muted rounded animate-pulse'></div>
          <div className='h-12 bg-muted rounded animate-pulse'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='mb-6'>
      <h2 className='mb-3 text-base font-bold text-foreground'>Hand Preference</h2>
      <div className='grid grid-cols-2 gap-4'>
        {HAND_OPTIONS.map((hand) => {
          const isCurrentHand = currentHand === hand.id;
          const targetUrl = isCurrentHand ? '#' : getHandVariationUrl(hand.id, handLinks);

          return (
            <a
              key={hand.id}
              href={targetUrl}
              className={cn(
                'h-12 text-base font-medium rounded flex items-center justify-center transition-all duration-200',
                isCurrentHand
                  ? 'bg-black text-white cursor-default'
                  : 'bg-card text-card-foreground border border-border hover:bg-muted hover:text-foreground'
              )}
              onClick={isCurrentHand ? (e) => e.preventDefault() : undefined}
              aria-label={isCurrentHand ? `Current selection: ${hand.name}` : `Switch to ${hand.name}`}
            >
              {hand.name}
              {isCurrentHand && <span className='ml-2'>✓</span>}
            </a>
          );
        })}
      </div>

      {/* Debug info in development */}
      {import.meta.env.DEV && (
        <div className='mt-2 text-xs text-muted-foreground'>
          <div>Current: {currentHand}</div>
          <div>Hand links: {Object.keys(handLinks).length} links found</div>
        </div>
      )}
    </div>
  );
}