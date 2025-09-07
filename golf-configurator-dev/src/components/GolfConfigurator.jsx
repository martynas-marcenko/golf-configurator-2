import { useEffect, useState } from 'preact/hooks';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { HandSelector } from './HandSelector';
// IronSetSelector removed - using direct club selection
import { ClubGrid } from './ClubGrid';
import { ShaftPicker } from './ShaftPicker';
import { CartSummary } from './CartSummary';
import { Toast } from './Toast';
import { selectedHand, selectedClubs, ironSetType, error, isLoading, productService } from '../hooks/useGolfState';

/**
 * Main Golf Configurator Component
 * Mirrors the exact functionality from golf-configurator-simple.js
 */
export function GolfConfigurator() {
  console.log('🏌️ Golf Configurator: PREACT VERSION', 'v1.0.0', 'loaded at', new Date().toISOString());
  console.log('💰 FEATURE: Dynamic currency formatting enabled');
  console.log('🔧 FEATURE: Preact signals for reactive state management');
  console.log('🎯 BUILD: Preact + shadcn/ui implementation');

  const [currentTab, setCurrentTab] = useState('club');

  // Auto-advance to next tab when conditions are met
  useEffect(() => {
    if (selectedHand.value && !currentTab.includes('club')) {
      // Hand is selected, can enable shaft tab
    }
    if (selectedClubs.value.length >= 5) {
      // Clubs selected, can enable shaft tab
    }
  }, [selectedHand.value, selectedClubs.value.length]);

  // Initialize ProductService like vanilla version
  useEffect(() => {
    const initializeConfigurator = async () => {
      try {
        console.log('🏌️ Starting configurator initialization...');

        // Fetch club head products using the same approach as vanilla
        console.log('🏌️ Fetching club head products...');
        await productService.fetchClubHeadProducts();

        console.log('✅ Configurator initialization complete');
      } catch (error) {
        console.error('🏌️ Failed to initialize configurator:', error);
        error.value = 'Failed to load product data';
      }
    };

    initializeConfigurator();
  }, []);

  return (
    <div className='golf-configurator max-w-xl mx-auto p-6 space-y-6'>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-center'>Golf Club Configurator</CardTitle>
          <p className='text-center text-muted-foreground'>Build your perfect golf set with custom shaft options</p>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error.value && (
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='p-4'>
            <div className='flex items-center text-red-600'>
              <span className='text-xl mr-2'>⚠️</span>
              <span>{error.value}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading Overlay */}
      {isLoading.value && (
        <div className='fixed inset-0 bg-black/20 flex items-center justify-center z-50'>
          <Card className='p-6'>
            <div className='flex items-center space-x-3'>
              <div className='animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full'></div>
              <span>Loading...</span>
            </div>
          </Card>
        </div>
      )}

      {/* Tabbed Configuration Interface */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='club'>Club</TabsTrigger>
          <TabsTrigger value='shaft' disabled={!selectedHand.value || selectedClubs.value.length === 0}>
            Shaft
          </TabsTrigger>
          <TabsTrigger value='grip' disabled={!selectedHand.value || selectedClubs.value.length === 0}>
            Grip
          </TabsTrigger>
          <TabsTrigger value='review' disabled={selectedClubs.value.length === 0}>
            Review
          </TabsTrigger>
        </TabsList>

        <TabsContent value='club' className='space-y-6 mt-6'>
          {/* Hand Selection */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg font-medium'>Select Hand</CardTitle>
            </CardHeader>
            <CardContent>
              <HandSelector />
            </CardContent>
          </Card>

          {/* Club Selection - Always visible with all clubs pre-selected */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg font-medium'>
                Choose Your Clubs ({selectedClubs.value.length} selected)
              </CardTitle>
              <p className='text-sm text-muted-foreground mt-2'>
                Current selection: {ironSetType.value} ({selectedClubs.value.length} clubs)
                <br />
                Minimum 5 clubs required • 6-PW always selected • 4 and 5 are optional
              </p>
            </CardHeader>
            <CardContent>
              <ClubGrid />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='shaft' className='space-y-6 mt-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-sm font-medium'>Customize Shafts</CardTitle>
              <p className='text-sm text-muted-foreground mt-2'>Upgrade your clubs with premium shaft options</p>
            </CardHeader>
            <CardContent>
              <ShaftPicker />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='grip' className='space-y-6 mt-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg font-medium'>Customize Grips</CardTitle>
              <p className='text-sm text-muted-foreground mt-2'>Coming soon - grip customization options</p>
            </CardHeader>
            <CardContent>
              <div className='text-center py-8 text-muted-foreground'>
                <div className='text-4xl mb-4'>🚧</div>
                <p>Grip customization feature coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='review' className='space-y-6 mt-6'>
          {/* Cart Summary in Review Tab */}
          {selectedClubs.value.length > 0 && <CartSummary />}
        </TabsContent>
      </Tabs>

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
}
