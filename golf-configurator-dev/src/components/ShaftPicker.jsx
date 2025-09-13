import { useState, useEffect } from 'preact/hooks';
import { Check } from 'lucide-react';
import { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import {
  actions,
  selectedShaftBrand,
  selectedShaftFlex,
  selectedShaftLength,
  isLoading,
  Logger
} from '../hooks/useGolfState';
import { SHAFT_LENGTHS } from '../constants/defaults';
import * as shaftService from '../services/ShaftService';
import { cn } from '../lib/utils';

/**
 * ShaftPicker Component
 * Clean architecture using direct signals like other components
 */
export function ShaftPicker() {
  // State for API data (not user selections - those are in signals)
  const [shaftOptions, setShaftOptions] = useState([]);
  const [loadingShafts, setLoadingShafts] = useState(false);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);

  // Direct signal access (like other components)
  const brand = selectedShaftBrand.value;
  const flex = selectedShaftFlex.value;
  const length = selectedShaftLength.value;


  // Load available brands on mount
  useEffect(() => {
    const loadBrands = async () => {
      setLoadingBrands(true);
      try {
        const brands = await shaftService.getAvailableBrands();
        Logger.info(`ShaftPicker: Found ${brands.length} available brands`);
        setAvailableBrands(brands);

        // If we have a persisted brand, load its options
        if (brand && brands.includes(brand)) {
          Logger.info(`ShaftPicker: Auto-loading options for persisted brand: ${brand}`);
          await loadShaftOptionsForBrand(brand);
        }
      } catch (error) {
        Logger.error('ShaftPicker: Error loading brands', error);
        setAvailableBrands([]);
      } finally {
        setLoadingBrands(false);
      }
    };

    loadBrands();
  }, []); // Only run once on mount

  // Helper function to load shaft options
  const loadShaftOptionsForBrand = async (brandName) => {
    setLoadingShafts(true);
    try {
      const options = await actions.loadShaftOptions(brandName);
      setShaftOptions(options);
      Logger.info(`ShaftPicker: Loaded ${options.length} shaft options for ${brandName}`);
    } catch (error) {
      Logger.error(`ShaftPicker: Error loading shaft options for ${brandName}`, error);
      setShaftOptions([]);
    } finally {
      setLoadingShafts(false);
    }
  };

  // Brand change handler - clean and simple
  const handleBrandChange = async (selectedBrand) => {
    await actions.setShaftBrand(selectedBrand);

    if (selectedBrand) {
      await loadShaftOptionsForBrand(selectedBrand);
    } else {
      setShaftOptions([]);
    }
  };

  // Get flex options from loaded shaft data
  const getFlexOptions = () => {
    if (!shaftOptions.length) return [];

    return shaftOptions.map((option) => ({
      flex: option.title,
      price: option.price || 0,
      option: option,
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
          <SelectRoot value={brand} onValueChange={handleBrandChange}>
            {({ value, open, setOpen, onValueChange, onKeyDown }) => (
              <>
                <SelectTrigger value={value} open={open} setOpen={setOpen} onKeyDown={onKeyDown}>
                  <SelectValue placeholder='Choose a brand...' value={value} />
                </SelectTrigger>
                <SelectContent open={open}>
                  {availableBrands.map((brandOption) => (
                    <SelectItem key={brandOption} value={brandOption} selected={value === brandOption} onValueChange={onValueChange}>
                      <span className='font-medium'>{brandOption}</span>
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

      {/* Flex Selection */}
      {brand && shaftOptions.length > 0 && !loadingShafts && (
        <div className='mb-6'>
          <h2 className='mb-3 text-base font-bold text-foreground'>Select Flex</h2>
          <div className='grid grid-cols-3 gap-4'>
            {getFlexOptions().map((option) => (
              <button
                key={option.flex}
                onClick={() => actions.setShaftFlex(option.flex)}
                className={cn(
                  'group relative h-16 w-full rounded-lg border-2 transition-all duration-200 ease-in-out',
                  'flex flex-col items-center justify-center text-base font-semibold',
                  'hover:shadow-lg hover:-translate-y-1',
                  flex === option.flex
                    ? 'border-black bg-black/10 shadow-md shadow-black/20'
                    : 'border-border bg-card hover:border-muted-foreground hover:bg-muted'
                )}
              >
                <span
                  className={cn(
                    'transition-colors duration-200 mb-1',
                    flex === option.flex ? 'text-black' : 'text-card-foreground group-hover:text-foreground'
                  )}
                >
                  {option.flex}
                </span>
                <span
                  className={cn(
                    'text-sm transition-colors duration-200',
                    flex === option.flex ? 'text-black/70' : 'text-muted-foreground'
                  )}
                >
                  £{(option.price / 100).toFixed(2)}
                </span>

                {flex === option.flex && (
                  <div className='absolute -top-2 -right-2 h-6 w-6 rounded-full bg-black flex items-center justify-center shadow-lg'>
                    <Check className='h-3.5 w-3.5 text-white' strokeWidth={3} />
                  </div>
                )}

                {flex === option.flex && (
                  <div className='absolute inset-0 rounded-lg bg-black/5 ring-1 ring-black/20' />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Shaft Length Selection */}
      {brand && shaftOptions.length > 0 && !loadingShafts && (
        <div className='mb-6'>
          <h2 className='mb-3 text-base font-bold text-foreground'>Select Shaft Length</h2>
          <SelectRoot value={length} onValueChange={(length) => actions.setShaftLength(length)}>
            {({ value, open, setOpen, onValueChange, onKeyDown }) => (
              <>
                <SelectTrigger value={value} open={open} setOpen={setOpen} onKeyDown={onKeyDown}>
                  <SelectValue placeholder='Choose shaft length...' value={value} />
                </SelectTrigger>
                <SelectContent open={open}>
                  {SHAFT_LENGTHS.map((lengthOption) => (
                    <SelectItem key={lengthOption} value={lengthOption} selected={value === lengthOption} onValueChange={onValueChange}>
                      <div className='flex items-center justify-between w-full'>
                        <span>{lengthOption}</span>
                        {lengthOption === 'Standard' && <Check className='h-4 w-4 text-black' />}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </>
            )}
          </SelectRoot>
        </div>
      )}

      {/* No Shafts Available Message */}
      {brand && shaftOptions.length === 0 && !loadingShafts && (
        <div className='mb-6 p-4 border border-yellow-200 bg-yellow-50 rounded-lg'>
          <div className='flex items-center text-yellow-800'>
            <span className='text-xl mr-2'>⚠️</span>
            <div>
              <div className='font-medium'>No shafts available</div>
              <div className='text-sm'>
                No {brand} shafts found in inventory. Please try another brand or contact support.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}