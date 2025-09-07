import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  selectedClubs,
  selectedShafts,
  selectedHand,
  ironSetType,
  formattedTotalPrice,
  canAddToCart,
  isLoading,
  actions,
} from '../hooks/useGolfState';

export function CartSummary() {
  const handleAddToCart = async () => {
    const success = await actions.addToCart();
    if (success) {
      // Success feedback handled by toast
      console.log('✅ Successfully added to cart');
    }
  };

  const getShaftUpgradeCount = () => {
    return Object.keys(selectedShafts.value).filter((clubId) => selectedShafts.value[clubId]).length;
  };

  return (
    <Card className='sticky top-4'>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>Order Summary</span>
          <span className='text-2xl font-bold text-primary'>{formattedTotalPrice.value}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Configuration Summary */}
        <div className='space-y-2 text-sm'>
          <div className='flex justify-between'>
            <span>Hand:</span>
            <span className='font-medium capitalize'>{selectedHand.value?.replace('-', ' ') || 'Not selected'}</span>
          </div>

          <div className='flex justify-between'>
            <span>Set Size:</span>
            <span className='font-medium'>{ironSetType.value?.replace('-', ' ') || 'Not selected'}</span>
          </div>

          <div className='flex justify-between'>
            <span>Clubs:</span>
            <span className='font-medium'>{selectedClubs.value.length} selected</span>
          </div>

          {getShaftUpgradeCount() > 0 && (
            <div className='flex justify-between'>
              <span>Shaft Upgrades:</span>
              <span className='font-medium'>{getShaftUpgradeCount()} clubs</span>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className='border-t pt-4'>
          <div className='space-y-2'>
            {/* Club List */}
            <h4 className='font-medium text-sm'>Selected Clubs:</h4>
            <div className='space-y-1 max-h-32 overflow-y-auto'>
              {selectedClubs.value.map((club) => (
                <div key={club.id} className='flex justify-between text-xs'>
                  <span>{club.name}</span>
                  <span>
                    {selectedShafts.value[club.id] ? (
                      <span className='text-primary'>+ Upgraded Shaft</span>
                    ) : (
                      <span className='text-muted-foreground'>Standard Shaft</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={!canAddToCart.value || isLoading.value}
          className='w-full h-12 text-lg'
          size='lg'
        >
          {isLoading.value ? (
            <div className='flex items-center space-x-2'>
              <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full'></div>
              <span>Adding to Cart...</span>
            </div>
          ) : (
            `Add ${ironSetType.value || 'Set'} to Cart`
          )}
        </Button>

        {/* Requirements Notice */}
        {!canAddToCart.value && (
          <div className='text-xs text-muted-foreground text-center'>
            {!selectedHand.value && 'Please select hand preference. '}
            {selectedClubs.value.length < 5 && 'Minimum 5 clubs required.'}
          </div>
        )}

        {/* Additional Info */}
        <div className='text-xs text-muted-foreground space-y-1 pt-2 border-t'>
          <p>• Free shipping on orders over £200</p>
          <p>• Professional club fitting available</p>
          <p>• 30-day satisfaction guarantee</p>
        </div>
      </CardContent>
    </Card>
  );
}
