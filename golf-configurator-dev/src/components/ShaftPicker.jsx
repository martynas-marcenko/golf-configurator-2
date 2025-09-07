import { useState } from 'preact/hooks';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select } from './ui/select';
import { selectedClubs, selectedShafts, actions, shaftService } from '../hooks/useGolfState';

export function ShaftPicker() {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [shaftOptions, setShaftOptions] = useState([]);
  const [loadingShafts, setLoadingShafts] = useState(false);

  const availableBrands = shaftService.getAvailableBrands();

  const handleBrandChange = async (brand) => {
    setSelectedBrand(brand);
    if (!brand) {
      setShaftOptions([]);
      return;
    }

    setLoadingShafts(true);
    try {
      const options = await actions.loadShaftOptions(brand);
      setShaftOptions(options);
    } finally {
      setLoadingShafts(false);
    }
  };

  const handleShaftSelect = (clubId, shaftId) => {
    actions.selectShaft(clubId, shaftId);
  };

  return (
    <div className="space-y-4">
      {/* Brand Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Choose Shaft Brand</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select a premium shaft brand to see available options
          </p>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedBrand} 
            onChange={(e) => handleBrandChange(e.target.value)}
          >
            <option value="">Select a brand...</option>
            {availableBrands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </Select>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loadingShafts && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              <span>Loading shaft options...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shaft Options */}
      {selectedBrand && shaftOptions.length > 0 && !loadingShafts && (
        <div className="space-y-3">
          <h3 className="font-semibold">
            Available {selectedBrand} Shafts ({shaftOptions.length} options)
          </h3>
          
          {selectedClubs.value.map(club => (
            <Card key={club.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{club.name}</h4>
                  <span className="text-sm text-muted-foreground">
                    Current: {selectedShafts.value[club.id] ? 'Custom Shaft' : 'Standard Shaft'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {/* Standard Shaft Option */}
                  <Button
                    variant={!selectedShafts.value[club.id] ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleShaftSelect(club.id, null)}
                    className="justify-start"
                  >
                    <div className="text-left">
                      <div className="font-medium">Standard Shaft</div>
                      <div className="text-xs opacity-75">Included</div>
                    </div>
                  </Button>

                  {/* Premium Shaft Options */}
                  {shaftOptions.map(shaft => (
                    <Button
                      key={shaft.id}
                      variant={selectedShafts.value[club.id] === shaft.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleShaftSelect(club.id, shaft.id)}
                      disabled={!shaft.available}
                      className="justify-start"
                    >
                      <div className="text-left">
                        <div className="font-medium text-xs">{shaft.title}</div>
                        <div className="text-xs opacity-75">
                          +£{(shaft.price / 100).toFixed(2)}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Shafts Available */}
      {selectedBrand && shaftOptions.length === 0 && !loadingShafts && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center text-yellow-800">
              <span className="text-xl mr-2">⚠️</span>
              <div>
                <div className="font-medium">No shafts available</div>
                <div className="text-sm">
                  No {selectedBrand} shafts found in inventory. Please try another brand or contact support.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}