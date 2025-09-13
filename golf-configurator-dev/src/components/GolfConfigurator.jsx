import { useEffect, useState } from 'preact/hooks';
import { Button } from './ui/button';
import { ChevronRight, Check } from 'lucide-react';
import { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Tooltip } from './ui/tooltip';
import { ShaftPicker } from './ShaftPicker';
import {
  selectedHand,
  selectedClubs,
  selectedShafts,
  selectedGrip,
  selectedLie,
  handOptions,
  availableClubs,
  canAddToCart,
  actions,
  error,
  isLoading,
} from '../hooks/useGolfState';
import * as productService from '../services/ProductService';
import { cn } from '../lib/utils';

const steps = [
  { name: 'Club', active: true },
  { name: 'Shaft', active: false },
  { name: 'Grip', active: false },
  { name: 'Review', active: false },
];

const ironNumbers = ['4', '5', '6', '7', '8', '9', 'P'];

const gripData = {
  'Golf Pride': {
    models: ['Tour Velvet', 'MCC', 'MCC Plus4'],
    sizes: ['Standard', 'Midsize', 'Jumbo'],
  },
  Lamkin: {
    models: ['Crossline', 'UTx', 'ST Soft'],
    sizes: ['Standard', 'Midsize', 'Jumbo'],
  },
  Winn: {
    models: ['DriTac', 'Excel', 'Grips Wrap'],
    sizes: ['Standard', 'Midsize'],
  },
};

const shaftLeadTimes = {
  KBS: '2-4 weeks',
  Axiom: '1-2 weeks',
  'LA Golf': '3-5 weeks',
  'True Temper': '2-3 weeks',
  Fujikura: '4-6 weeks',
};

/**
 * Main Golf Configurator Component
 * Updated with new step-based UI design
 */
export function GolfConfigurator() {

  const [currentStep, setCurrentStep] = useState(0);

  // Get current lead time based on selected shafts
  const getCurrentLeadTime = () => {
    // Default lead time if no shafts selected
    const defaultLeadTime = '2 weeks';

    // Get selected shaft brands from ShaftService/data
    const selectedShaftIds = Object.values(selectedShafts.value);
    if (selectedShaftIds.length === 0) {
      return defaultLeadTime;
    }

    // For now, use KBS as the example since that's what's in the mockup
    // This should eventually be determined by the actual selected shaft brand
    // from the ShaftService data
    return shaftLeadTimes['KBS'] || defaultLeadTime;
  };

  // Helper functions
  const findClub = (clubNumber) => {
    return availableClubs.value.find(
      (c) => c.name.includes(clubNumber) || (clubNumber === 'P' && c.name.includes('PW'))
    );
  };

  const isClubSelected = (clubNumber) => {
    return selectedClubs.value.some(
      (club) => club.name.includes(clubNumber) || (clubNumber === 'P' && club.name.includes('PW'))
    );
  };

  // Check if a club is locked (6, 7, 8, 9, PW cannot be deselected)
  const isClubLocked = (clubNumber) => {
    return ['6', '7', '8', '9', 'P'].includes(clubNumber);
  };

  const toggleIron = (ironNumber) => {
    // Don't allow deselecting locked clubs (6, 7, 8, 9, PW)
    if (isClubLocked(ironNumber)) {
      return;
    }

    const club = findClub(ironNumber);
    if (!club) return;

    const isCurrentlySelected = isClubSelected(ironNumber);

    if (ironNumber === '4') {
      if (!isCurrentlySelected) {
        // Selecting 4: must also select 5
        const club5 = findClub('5');
        if (club5 && !isClubSelected('5')) {
          actions.toggleClub(club5);
        }
        actions.toggleClub(club);
      } else {
        // Deselecting 4: only deselect 4
        actions.toggleClub(club);
      }
    } else if (ironNumber === '5') {
      if (!isCurrentlySelected) {
        // Selecting 5: just select 5
        actions.toggleClub(club);
      } else {
        // Deselecting 5: must also deselect 4 if it's selected
        if (isClubSelected('4')) {
          const club4 = findClub('4');
          if (club4) {
            actions.toggleClub(club4);
          }
        }
        actions.toggleClub(club);
      }
    }
  };

  // Note: Default clubs (6-PW) are now initialized in useGolfState.js

  const reset = () => {
    setCurrentStep(0);
    actions.reset(); // Use the global reset from state management
  };

  // Removed old goToNextStep - replaced with handleNext

  const handleNext = async () => {
    if (currentStep === 0 && selectedHand.value && selectedClubs.value.length >= 5) {
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
    if (stepIndex <= getMaxUnlockedStep()) {
      setCurrentStep(stepIndex);
    }
  };

  const getMaxUnlockedStep = () => {
    // Step 0 (Club) is always available
    let maxStep = 0;

    // Step 1 (Shaft) unlocked when hand and clubs are selected (minimum 5 clubs)
    if (selectedHand.value && selectedClubs.value.length >= 5) {
      maxStep = 1;
    }

    // Step 2 (Grip) unlocked when step 1 is accessible (simplified for now)
    if (selectedHand.value && selectedClubs.value.length >= 5) {
      maxStep = 2;
    }

    // Step 3 (Review) unlocked when grip requirements are met
    if (
      selectedHand.value &&
      selectedClubs.value.length >= 5 &&
      selectedGrip.value?.brand &&
      selectedGrip.value?.model &&
      selectedGrip.value?.size
    ) {
      maxStep = 3;
    }

    return maxStep;
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
    <div className='min-h-screen bg-background p-3'>
      <div className='mx-auto max-w-md'>
        {/* Progress Steps */}
        <div className='mb-6 flex items-center justify-between'>
          {steps.map((step, index) => (
            <div key={step.name} className='flex items-center'>
              <div className='flex items-center'>
                <button
                  className={cn(
                    'flex items-center transition-all duration-200',
                    index <= getMaxUnlockedStep() ? 'cursor-pointer hover:opacity-75' : 'cursor-not-allowed opacity-50'
                  )}
                  onClick={() => goToStep(index)}
                  disabled={index > getMaxUnlockedStep()}
                >
                  {index <= currentStep ? (
                    <div className='mr-2 h-5 w-5 rounded-full bg-black flex items-center justify-center'>
                      <svg className='h-3 w-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                        <path
                          fillRule='evenodd'
                          d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'mr-2 h-5 w-5 rounded-full flex items-center justify-center',
                        index <= getMaxUnlockedStep() ? 'bg-muted' : 'bg-muted/50'
                      )}
                    >
                      <svg
                        className={cn(
                          'h-3 w-3',
                          index <= getMaxUnlockedStep() ? 'text-muted-foreground' : 'text-muted-foreground/50'
                        )}
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                  )}
                  <span
                    className={cn(
                      'text-base font-medium transition-colors duration-200',
                      index === currentStep
                        ? 'text-black'
                        : index <= getMaxUnlockedStep()
                        ? 'text-muted-foreground hover:text-foreground'
                        : 'text-muted-foreground/50'
                    )}
                  >
                    {step.name}
                  </span>
                </button>
              </div>
              {index < steps.length - 1 && <div className='mx-4 h-px w-8 bg-border' />}
            </div>
          ))}
        </div>

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
            {/* Select Hand */}
            <div className='mb-6'>
              <h2 className='mb-3 text-base font-bold text-foreground'>Select Hand</h2>
              <div className='grid grid-cols-2 gap-4'>
                {handOptions.value.map((hand) => (
                  <Button
                    key={hand.id}
                    variant={selectedHand.value === hand.id ? 'default' : 'outline'}
                    className={cn(
                      'h-12 text-base font-medium',
                      selectedHand.value === hand.id
                        ? 'bg-black text-white hover:bg-black/90'
                        : 'bg-card text-card-foreground border-border hover:bg-muted hover:text-foreground'
                    )}
                    onClick={() => actions.setHand(hand.id)}
                  >
                    {hand.name}
                  </Button>
                ))}
              </div>
            </div>
            {/* Select Irons */}
            <div className='mb-6'>
              <div className='mb-4'>
                <div className='flex items-center justify-between mb-2'>
                  <h2 className='text-base font-bold text-foreground'>Choose Your Clubs:</h2>
                  <span className='text-sm font-medium text-primary'>
                    {selectedClubs.value.length} {selectedClubs.value.length === 1 ? 'club' : 'clubs'} selected
                  </span>
                </div>
                <p className='text-sm text-muted-foreground'>
                  6-PW are required and included. Optional: 4 & 5 irons. Selecting 4 requires 5.
                </p>
              </div>

              <div className='grid grid-cols-7 gap-3'>
                {ironNumbers.map((iron) => (
                  <Tooltip
                    key={iron}
                    content={isClubLocked(iron) ? 'Required club - included in all sets' : null}
                    side='top'
                  >
                    <button
                      onClick={() => toggleIron(iron)}
                      className={cn(
                        'group relative h-16 w-full rounded-lg border-2 transition-all duration-200 ease-in-out',
                        'flex flex-col items-center justify-center text-base font-semibold',
                        // Locked clubs (6, 7, 8, 9, PW) - always selected, no hover effects
                        isClubLocked(iron)
                          ? 'border-black bg-black/10 shadow-md shadow-black/20 cursor-default'
                          : isClubSelected(iron)
                          ? 'border-black bg-black/10 shadow-md shadow-black/20 hover:shadow-lg hover:-translate-y-1'
                          : 'border-dashed border-border bg-card hover:border-muted-foreground hover:bg-muted hover:shadow-lg hover:-translate-y-1'
                      )}
                    >
                      <span
                        className={cn(
                          'transition-colors duration-200',
                          isClubSelected(iron) ? 'text-black' : 'text-card-foreground group-hover:text-foreground'
                        )}
                      >
                        {iron === 'P' ? 'PW' : iron}
                      </span>

                      {/* Enhanced checkmark with smooth animation */}
                      <div
                        className={cn(
                          'absolute -top-2 -right-2 h-6 w-6 rounded-full transition-all duration-300 ease-in-out',
                          'flex items-center justify-center shadow-lg',
                          isClubSelected(iron) ? 'bg-black scale-100 opacity-100' : 'bg-muted scale-0 opacity-0'
                        )}
                      >
                        <Check className='h-3.5 w-3.5 text-white' strokeWidth={3} />
                      </div>

                      {/* Subtle glow effect for selected items */}
                      {isClubSelected(iron) && (
                        <div className='absolute inset-0 rounded-lg bg-black/5 ring-1 ring-black/20' />
                      )}
                    </button>
                  </Tooltip>
                ))}
              </div>
            </div>
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
                      {Object.keys(gripData).map((brand) => (
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
                        {gripData[selectedGrip.value.brand]?.models.map((model) => (
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
            {selectedGrip.value?.brand && selectedGrip.value?.model && (
              <div className='mb-6'>
                <h2 className='mb-3 text-base font-bold text-foreground'>Select Grip Size</h2>
                <SelectRoot
                  value={selectedGrip.value?.size || ''}
                  onValueChange={(size) => {
                    if (selectedGrip.value?.brand && selectedGrip.value?.model) {
                      actions.setGrip(selectedGrip.value.brand, selectedGrip.value.model, size);
                    }
                  }}
                >
                  {({ value, open, setOpen, onValueChange, onKeyDown }) => (
                    <>
                      <SelectTrigger value={value} open={open} setOpen={setOpen} onKeyDown={onKeyDown}>
                        <SelectValue placeholder='Choose a grip size...' value={value} />
                      </SelectTrigger>
                      <SelectContent open={open}>
                        {gripData[selectedGrip.value.brand]?.sizes.map((size) => (
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
              {/* Hand Selection */}
              <div className='flex items-center justify-between p-4 bg-card rounded-lg border'>
                <div>
                  <span className='text-sm text-muted-foreground'>Hand</span>
                  <p className='font-medium text-base'>
                    {handOptions.value.find((h) => h.id === selectedHand.value)?.name || 'Not selected'}
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
            (currentStep === 0 && selectedHand.value && selectedClubs.value.length >= 5) ||
              currentStep === 1 ||
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
            (currentStep === 0 && (!selectedHand.value || selectedClubs.value.length < 5)) ||
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
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Estimated lead time is {getCurrentLeadTime()}.</span>
          <button onClick={reset} className='font-medium text-foreground underline hover:no-underline'>
            Reset
          </button>
        </div>

      </div>
    </div>
  );
}
