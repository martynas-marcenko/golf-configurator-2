import { useEffect, useState } from 'preact/hooks';
import { Button } from './ui/button';
import { ChevronRight } from 'lucide-react';
import { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { ShaftPicker } from './ShaftPicker';
import { StepIndicator } from './StepIndicator';
import { ClubSelector } from './ClubSelector';
import {
  selectedClubs,
  selectedShaftBrand,
  selectedShaftFlex,
  selectedShaftLength,
  selectedGrip,
  selectedLie,
  canAddToCart,
  maxUnlockedStep,
  actions,
  error,
  isLoading,
} from '../store/golfStore';
import { GRIP_DATA } from '../constants/defaults';
import { getCurrentLeadTime } from '../utils/validation';
import * as productService from '../services/ProductService';
import { cn } from '../lib/utils';

// All constants imported from single source of truth in constants/defaults.js

/**
 * Main Golf Configurator Component
 * Updated with new step-based UI design
 */
export function GolfConfigurator() {
  const [currentStep, setCurrentStep] = useState(0);

  // Simplified club toggle using store logic
  const toggleIron = (ironNumber) => {
    actions.toggleClubByNumber(ironNumber);
  };

  // Note: Default clubs (6-PW) are now initialized in useGolfState.js

  const reset = () => {
    setCurrentStep(0);
    actions.reset(); // Use the global reset from state management
  };

  // Removed old goToNextStep - replaced with handleNext

  const handleNext = async () => {
    if (currentStep === 0 && selectedClubs.value.length >= 5) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      // For now, allow progression from shaft step (ShaftPicker handles its own validation)
      setCurrentStep(2);
    } else if (
      currentStep === 2 &&
      selectedGrip.value?.brand &&
      selectedGrip.value?.model &&
      selectedGrip.value?.size
    ) {
      setCurrentStep(3);
    } else if (currentStep === 3 && canAddToCart.value) {
      // Trigger Add to Cart functionality
      const success = await actions.addToCart();
      if (success) {
        // Could reset or show success message
      }
    }
  };

  const goToStep = (stepIndex) => {
    // Can only go to steps that are unlocked
    if (stepIndex <= maxUnlockedStep.value) {
      setCurrentStep(stepIndex);
    }
  };

  // Initialize ProductService like vanilla version
  useEffect(() => {
    const initializeConfigurator = async () => {
      try {
        // Fetch club head products using the same approach as vanilla
        await productService.fetchClubHeadProducts();
        // Default clubs are already initialized in useGolfState.js
      } catch (error) {
        console.error('🏌️ Failed to initialize configurator:', error);
        error.value = 'Failed to load product data';
      }
    };

    initializeConfigurator();
  }, []);

  return (
    <div className='p-3'>
      <div className='mx-auto max-w-xl'>
        {/* Progress Steps */}
        <StepIndicator currentStep={currentStep} maxUnlockedStep={maxUnlockedStep.value} onStepClick={goToStep} />

        {/* Active step indicator */}
        <div className='mb-6 h-1 bg-muted rounded'>
          <div
            className={cn('h-1 bg-black rounded transition-all duration-300', {
              'w-1/4': currentStep === 0,
              'w-2/4': currentStep === 1,
              'w-3/4': currentStep === 2,
              'w-full': currentStep === 3,
            })}
          />
        </div>

        {/* Error Display */}
        {error.value && (
          <div className='mb-4 p-3 border border-red-200 bg-red-50 rounded-lg'>
            <div className='flex items-center text-red-600'>
              <span className='text-xl mr-2'>⚠️</span>
              <span>{error.value}</span>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading.value && (
          <div className='fixed inset-0 bg-black/20 flex items-center justify-center z-50'>
            <div className='bg-white p-6 rounded-lg shadow-lg'>
              <div className='flex items-center space-x-3'>
                <div className='animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full'></div>
                <span>Loading...</span>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        {currentStep === 0 && (
          <div>
            <ClubSelector selectedClubs={selectedClubs.value} onClubToggle={toggleIron} />
            <div className='mb-6'>
              <h2 className='mb-3 text-base font-bold text-foreground'>Select Lie Adjustment</h2>
              <SelectRoot value={selectedLie.value} onValueChange={(lie) => actions.setLie(lie)}>
                {({ value, open, setOpen, onValueChange, onKeyDown }) => (
                  <>
                    <SelectTrigger value={value} open={open} setOpen={setOpen} onKeyDown={onKeyDown}>
                      <SelectValue placeholder='Select lie adjustment...' value={value} />
                    </SelectTrigger>
                    <SelectContent open={open}>
                      {['Standard', '+1°', '+2°', '-1°', '-2°'].map((lie) => (
                        <SelectItem key={lie} value={lie} selected={value === lie} onValueChange={onValueChange}>
                          <span>{lie}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </>
                )}
              </SelectRoot>
            </div>
          </div>
        )}

        {currentStep === 1 && <ShaftPicker />}

        {currentStep === 2 && (
          <>
            {/* Grip Brand Selection */}
            <div className='mb-6'>
              <h2 className='mb-3 text-base font-bold text-foreground'>Select Grip Brand</h2>
              <SelectRoot
                value={selectedGrip.value?.brand || ''}
                onValueChange={(brand) => {
                  // Reset model and size when brand changes
                  selectedGrip.value = { brand, model: '', size: '' };
                }}
              >
                {({ value, open, setOpen, onValueChange, onKeyDown }) => (
                  <>
                    <SelectTrigger value={value} open={open} setOpen={setOpen} onKeyDown={onKeyDown}>
                      <SelectValue placeholder='Choose a grip brand...' value={value} />
                    </SelectTrigger>
                    <SelectContent open={open}>
                      {Object.keys(GRIP_DATA).map((brand) => (
                        <SelectItem key={brand} value={brand} selected={value === brand} onValueChange={onValueChange}>
                          <span className='font-medium'>{brand}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </>
                )}
              </SelectRoot>
            </div>

            {/* Grip Model Selection */}
            {selectedGrip.value?.brand && (
              <div className='mb-6'>
                <h2 className='mb-3 text-base font-bold text-foreground'>Select Grip Model</h2>
                <SelectRoot
                  value={selectedGrip.value?.model || ''}
                  onValueChange={(model) => {
                    selectedGrip.value = {
                      ...selectedGrip.value,
                      model,
                      size: '', // Reset size when model changes
                    };
                  }}
                >
                  {({ value, open, setOpen, onValueChange, onKeyDown }) => (
                    <>
                      <SelectTrigger value={value} open={open} setOpen={setOpen} onKeyDown={onKeyDown}>
                        <SelectValue placeholder='Choose a grip model...' value={value} />
                      </SelectTrigger>
                      <SelectContent open={open}>
                        {GRIP_DATA[selectedGrip.value.brand]?.models.map((model) => (
                          <SelectItem
                            key={model}
                            value={model}
                            selected={value === model}
                            onValueChange={onValueChange}
                          >
                            <span>{model}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </>
                  )}
                </SelectRoot>
              </div>
            )}

            {/* Grip Size Selection */}
            {selectedGrip.value?.brand && (
              <div className='mb-6'>
                <h2 className='mb-3 text-base font-bold text-foreground'>Select Grip Size</h2>
                <SelectRoot
                  value={selectedGrip.value?.size || ''}
                  onValueChange={(size) => {
                    if (selectedGrip.value?.brand) {
                      actions.setGrip(selectedGrip.value.brand, selectedGrip.value?.model || '', size);
                    }
                  }}
                >
                  {({ value, open, setOpen, onValueChange, onKeyDown }) => (
                    <>
                      <SelectTrigger value={value} open={open} setOpen={setOpen} onKeyDown={onKeyDown}>
                        <SelectValue placeholder='Choose a grip size...' value={value} />
                      </SelectTrigger>
                      <SelectContent open={open}>
                        {GRIP_DATA[selectedGrip.value.brand]?.sizes.map((size) => (
                          <SelectItem key={size} value={size} selected={value === size} onValueChange={onValueChange}>
                            <span>{size}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </>
                  )}
                </SelectRoot>
              </div>
            )}
          </>
        )}

        {currentStep === 3 && (
          <div className='mb-6'>
            <h2 className='mb-4 text-base font-bold text-foreground'>Review Your Selection</h2>

            <div className='space-y-3'>
              {/* Iron Selection */}
              <div className='flex items-center justify-between p-4 bg-card rounded-lg border'>
                <div>
                  <span className='text-sm text-muted-foreground'>Iron(s)</span>
                  <p className='font-medium text-base'>
                    {selectedClubs.value.map((club) => (club.name.includes('PW') ? 'PW' : club.name)).join(', ') ||
                      'None selected'}
                  </p>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentStep(0)}
                  className='text-black border-black hover:bg-black hover:text-white'
                >
                  Edit
                </Button>
              </div>

              {/* Shaft Selection */}
              <div className='flex items-center justify-between p-4 bg-card rounded-lg border'>
                <div>
                  <span className='text-sm text-muted-foreground'>Shaft</span>
                  <p className='font-medium text-base'>Custom shaft configuration</p>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentStep(1)}
                  className='text-black border-black hover:bg-black hover:text-white'
                >
                  Edit
                </Button>
              </div>

              {/* Grip Selection */}
              <div className='flex items-center justify-between p-4 bg-card rounded-lg border'>
                <div>
                  <span className='text-sm text-muted-foreground'>Grip</span>
                  <p className='font-medium text-base'>
                    {selectedGrip.value?.brand && selectedGrip.value?.model && selectedGrip.value?.size
                      ? `${selectedGrip.value.brand} ${selectedGrip.value.model}, ${selectedGrip.value.size}`
                      : 'Not configured'}
                  </p>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentStep(2)}
                  className='text-black border-black hover:bg-black hover:text-white'
                >
                  Edit
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Next/Add to Cart Button */}
        <Button
          className={cn(
            'mb-4 w-full h-12 text-base font-medium rounded-full transition-all duration-200',
            (currentStep === 0 && selectedClubs.value.length >= 5) ||
              (currentStep === 1 && selectedShaftFlex.value && selectedShaftLength.value) ||
              (currentStep === 2 &&
                selectedGrip.value?.brand &&
                selectedGrip.value?.model &&
                selectedGrip.value?.size) ||
              (currentStep === 3 && canAddToCart.value)
              ? 'bg-black hover:bg-black/90 text-white'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300'
          )}
          onClick={handleNext}
          disabled={
            (currentStep === 0 && selectedClubs.value.length < 5) ||
            (currentStep === 1 && (!selectedShaftFlex.value || !selectedShaftLength.value)) ||
            (currentStep === 2 &&
              (!selectedGrip.value?.brand || !selectedGrip.value?.model || !selectedGrip.value?.size)) ||
            (currentStep === 3 && !canAddToCart.value) ||
            isLoading.value
          }
        >
          {isLoading.value ? (
            <>
              <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2'></div>
              Adding...
            </>
          ) : (
            <>
              {currentStep === 0
                ? 'Next / Shaft'
                : currentStep === 1
                ? 'Next / Grip'
                : currentStep === 2
                ? 'Next / Review'
                : 'Add to Cart'}
              <ChevronRight className='ml-2 h-4 w-4' />
            </>
          )}
        </Button>

        {/* Footer */}
        <div className='flex items-center justify-between'>
          <span>Estimated lead time is {getCurrentLeadTime(selectedShaftBrand.value)}.</span>
          <button onClick={reset} className='font-medium text-foreground underline hover:no-underline'>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
