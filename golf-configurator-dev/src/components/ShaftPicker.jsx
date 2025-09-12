import { useState, useEffect } from 'preact/hooks';
import { Check } from 'lucide-react';
import { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { actions } from '../hooks/useGolfState';
import * as shaftService from '../services/ShaftService';
import { cn } from '../lib/utils';

export function ShaftPicker() {
  // State for shaft configuration
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedFlex, setSelectedFlex] = useState('');
  const [selectedLie, setSelectedLie] = useState('Standard');
  const [selectedLength, setSelectedLength] = useState('Standard');

  // State for real Shopify data
  const [shaftOptions, setShaftOptions] = useState([]);
  const [loadingShafts, setLoadingShafts] = useState(false);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);

  console.log('🎯 UI DEBUG: ShaftPicker component rendered');
  console.log('🎯 UI DEBUG: Current selectedBrand state:', selectedBrand);
  console.log('🎯 UI DEBUG: Current shaftOptions length:', shaftOptions.length);
  console.log('🎯 UI DEBUG: Loading state:', loadingShafts);

  // Load available brands on mount
  useEffect(() => {
    const loadBrands = async () => {
      console.log('🎯 UI DEBUG: Loading available brands...');
      setLoadingBrands(true);
      try {
        const brands = await shaftService.getAvailableBrands();
        console.log('🎯 UI DEBUG: Received brands:', brands);
        setAvailableBrands(brands);
      } catch (error) {
        console.error('🎯 UI DEBUG: Error loading brands:', error);
        setAvailableBrands([]);
      } finally {
        setLoadingBrands(false);
      }
    };

    loadBrands();
  }, []);

  console.log('🎯 UI DEBUG: Available brands state:', availableBrands);

  // Shaft lengths and lie adjustments (same as GolfConfigurator)
  const shaftLengths = [
    '-2"',
    '-1.75"',
    '-1.5"',
    '-1.25"',
    '-1"',
    '-0.75"',
    '-0.5"',
    '-0.25"',
    'Standard',
    '+0.25"',
    '+0.5"',
    '+0.75"',
    '+1"',
    '+1.25"',
    '+1.5"',
    '+1.75"',
    '+2"',
  ];

  const lieAdjustments = ['2.0 Deg Up', '1.0 Deg Up', 'Standard', '1.0 Deg Flat', '2.0 Deg Flat'];

  const handleBrandChange = async (brand) => {
    console.log('🎯 UI DEBUG: handleBrandChange called with brand:', brand);
    console.log('🎯 UI DEBUG: Previous selectedBrand was:', selectedBrand);

    setSelectedBrand(brand);
    setSelectedFlex(''); // Reset flex when brand changes
    setSelectedLie('Standard');
    console.log('🎯 UI DEBUG: setSelectedBrand called with:', brand);

    if (!brand) {
      console.log('🎯 UI DEBUG: No brand selected, clearing shaft options');
      setShaftOptions([]);
      return;
    }

    console.log('🎯 UI DEBUG: Starting shaft loading for brand:', brand);
    setLoadingShafts(true);
    try {
      console.log('🎯 UI DEBUG: Calling actions.loadShaftOptions with:', brand);
      const options = await actions.loadShaftOptions(brand);
      console.log('🎯 UI DEBUG: Received shaft options:', options);
      console.log('🎯 UI DEBUG: Number of options received:', options.length);
      setShaftOptions(options);
      console.log('🎯 UI DEBUG: setShaftOptions called with', options.length, 'options');
    } catch (error) {
      console.error('🎯 UI DEBUG: Error in handleBrandChange:', error);
    } finally {
      console.log('🎯 UI DEBUG: Setting loadingShafts to false');
      setLoadingShafts(false);
    }
  };

  // Get available flex options from real Shopify data
  const getFlexOptions = () => {
    if (!shaftOptions.length) return [];

    // Each shaftOption is a Shopify variant representing a different flex
    // Use the variant title directly as the flex type and include all variant data
    return shaftOptions.map((option) => ({
      flex: option.title, // The variant title IS the flex type (Regular, Stiff, Extra Stiff)
      price: option.price || 0,
      option: option, // Keep the full variant data for cart operations
      variantId: option.id,
      available: option.available,
    }));
  };

  return (
    <>
      {/* Brand Selection */}
      <div className='mb-6'>
        <h2 className='mb-3 text-base font-bold text-foreground'>Select Shaft Brand</h2>

        {loadingBrands ? (
          <div className='flex items-center justify-center p-4 border rounded-lg'>
            <div className='animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2'></div>
            Loading available brands...
          </div>
        ) : availableBrands.length === 0 ? (
          <div className='p-4 border border-yellow-200 bg-yellow-50 rounded-lg'>
            <div className='flex items-center text-yellow-800'>
              <span className='text-xl mr-2'>⚠️</span>
              <div>
                <div className='font-medium'>No brands available</div>
                <div className='text-sm'>
                  No shaft products configured in theme settings. Please configure shaft products in the theme editor.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <SelectRoot
            value={selectedBrand}
            onValueChange={(value) => {
              console.log('🎯 UI DEBUG: Brand SelectRoot onValueChange called with:', value);
              handleBrandChange(value);
            }}
          >
            {({ value, open, setOpen, onValueChange, onKeyDown }) => (
              <>
                <SelectTrigger value={value} open={open} setOpen={setOpen} onKeyDown={onKeyDown}>
                  <SelectValue placeholder='Choose a brand...' value={value} />
                </SelectTrigger>
                <SelectContent open={open}>
                  {availableBrands.map((brand) => (
                    <SelectItem key={brand} value={brand} selected={value === brand} onValueChange={onValueChange}>
                      <span className='font-medium'>{brand}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </>
            )}
          </SelectRoot>
        )}

        {/* Loading indicator for shaft options */}
        {loadingShafts && (
          <div className='mt-3 flex items-center text-sm text-muted-foreground'>
            <div className='animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2'></div>
            Loading shaft options...
          </div>
        )}
      </div>

      {/* Flex Selection - Using Real Shopify Data */}
      {selectedBrand && shaftOptions.length > 0 && !loadingShafts && (
        <div className='mb-6'>
          <h2 className='mb-3 text-base font-bold text-foreground'>Select Flex</h2>
          <div className='grid grid-cols-3 gap-4'>
            {getFlexOptions().map((option) => (
              <button
                key={option.flex}
                onClick={() => {
                  console.log('🎯 UI DEBUG: Flex button clicked:', option.flex);
                  setSelectedFlex(option.flex);
                }}
                className={cn(
                  'group relative h-16 w-full rounded-lg border-2 transition-all duration-200 ease-in-out',
                  'flex flex-col items-center justify-center text-base font-semibold',
                  'hover:shadow-lg hover:-translate-y-1',
                  selectedFlex === option.flex
                    ? 'border-black bg-black/10 shadow-md shadow-black/20'
                    : 'border-border bg-card hover:border-muted-foreground hover:bg-muted'
                )}
              >
                <span
                  className={cn(
                    'transition-colors duration-200 mb-1',
                    selectedFlex === option.flex ? 'text-black' : 'text-card-foreground group-hover:text-foreground'
                  )}
                >
                  {option.flex}
                </span>
                <span
                  className={cn(
                    'text-sm transition-colors duration-200',
                    selectedFlex === option.flex ? 'text-black/70' : 'text-muted-foreground'
                  )}
                >
                  £{(option.price / 100).toFixed(2)}
                </span>

                {selectedFlex === option.flex && (
                  <div
                    className={cn(
                      'absolute -top-2 -right-2 h-6 w-6 rounded-full transition-all duration-300 ease-in-out',
                      'flex items-center justify-center shadow-lg',
                      'bg-black scale-100 opacity-100'
                    )}
                  >
                    <Check className='h-3.5 w-3.5 text-white' strokeWidth={3} />
                  </div>
                )}

                {selectedFlex === option.flex && (
                  <div className='absolute inset-0 rounded-lg bg-black/5 ring-1 ring-black/20' />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Shaft Length Selection */}
      {selectedBrand && shaftOptions.length > 0 && !loadingShafts && (
        <div className='mb-6'>
          <h2 className='mb-3 text-base font-bold text-foreground'>Select Shaft Length</h2>
          <SelectRoot value={selectedLength} onValueChange={setSelectedLength}>
            {({ value, open, setOpen, onValueChange, onKeyDown }) => (
              <>
                <SelectTrigger value={value} open={open} setOpen={setOpen} onKeyDown={onKeyDown}>
                  <SelectValue placeholder='Choose shaft length...' value={value} />
                </SelectTrigger>
                <SelectContent open={open}>
                  {shaftLengths.map((length) => (
                    <SelectItem key={length} value={length} selected={value === length} onValueChange={onValueChange}>
                      <div className='flex items-center justify-between w-full'>
                        <span>{length}</span>
                        {length === 'Standard' && <Check className='h-4 w-4 text-black' />}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </>
            )}
          </SelectRoot>
        </div>
      )}

      {/* No Shafts Available */}
      {selectedBrand && shaftOptions.length === 0 && !loadingShafts && (
        <div className='mb-6 p-4 border border-yellow-200 bg-yellow-50 rounded-lg'>
          <div className='flex items-center text-yellow-800'>
            <span className='text-xl mr-2'>⚠️</span>
            <div>
              <div className='font-medium'>No shafts available</div>
              <div className='text-sm'>
                No {selectedBrand} shafts found in inventory. Please try another brand or contact support.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
