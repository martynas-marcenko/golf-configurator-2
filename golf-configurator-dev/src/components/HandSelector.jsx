import { Button } from './ui/button';
import { selectedHand, handOptions, actions } from '../hooks/useGolfState';

export function HandSelector() {
  return (
    <div className='flex flex-wrap gap-3'>
      {handOptions.value.map((hand) => (
        <Button
          key={hand.id}
          variant={selectedHand.value === hand.id ? 'default' : 'outline'}
          onClick={() => actions.setHand(hand.id)}
          className='flex-1 min-w-0'
        >
          <div className='text-center'>
            <div className='font-medium'>{hand.name}</div>
          </div>
        </Button>
      ))}
    </div>
  );
}
