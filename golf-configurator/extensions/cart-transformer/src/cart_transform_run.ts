import type { CartTransformRunInput, CartTransformRunResult } from '../generated/api';

export function cartTransformRun(input: CartTransformRunInput): CartTransformRunResult {
  // Use the actual input type from the generated schema
  type CartLineInput = (typeof input.cart.lines)[0];
  const groupedItems: Record<string, CartLineInput[]> = {};

  // Real Product Merge logging - Version 4.2
  console.log('=== Cart Transformer Started v4.2 (Dynamic Parent Variant + Configurable Bundle) ===');
  console.log('Cart lines:', input.cart.lines.length);
  console.log('Timestamp:', new Date().toISOString());

  input.cart.lines.forEach((line, index) => {
    console.log(`Processing line ${index + 1}:`, line.id);
    console.log('Line cost:', line.cost.amountPerQuantity.amount, line.cost.amountPerQuantity.currencyCode);

    const bundleId = line.bundleId;
    console.log('BundleId exists:', !!bundleId);
    console.log('BundleId value:', bundleId?.value || 'NO VALUE');

    if (bundleId?.value) {
      const groupId = bundleId.value;
      console.log('Using group ID:', groupId);

      if (!groupedItems[groupId]) {
        groupedItems[groupId] = [];
        console.log('Created new group:', groupId);
      }
      groupedItems[groupId].push(line);
    } else {
      console.log('Line has no bundleId, skipping transformation');
    }
  });

  console.log('Groups created:', Object.keys(groupedItems).length);
  console.log('Group IDs:', Object.keys(groupedItems));

  const operations = Object.entries(groupedItems).map(([bundleId, group]) => {
    console.log('Creating merge for bundle:', bundleId, 'with', group.length, 'items');

    // Log each component for debugging
    group.forEach((item, index) => {
      const componentType = item.componentType?.value || 'main';
      const merchandiseId = item.merchandise.__typename === 'ProductVariant' ? item.merchandise.id : 'N/A';
      console.log(
        `  Component ${index + 1}: ${componentType} (${merchandiseId}) - ${item.cost.amountPerQuantity.amount} ${
          item.cost.amountPerQuantity.currencyCode
        }`
      );
    });

    // Get the first item to extract bundle info
    const firstItem = group[0];
    const hand = firstItem.hand?.value || 'Right';
    const setSize = firstItem.setSize?.value || '5PW';
    const clubList = firstItem.clubList?.value || '';

    // Calculate total bundle price from all real products
    const totalPrice = group.reduce((sum, item) => {
      const itemPrice = parseFloat(item.cost.amountPerQuantity.amount);
      const merchandiseId = item.merchandise.__typename === 'ProductVariant' ? item.merchandise.id : 'N/A';
      console.log(`Item ${merchandiseId} price:`, itemPrice);
      return sum + itemPrice * item.quantity;
    }, 0);

    const currency = firstItem.cost.amountPerQuantity.currencyCode;

    console.log('Total bundle price:', totalPrice, currency);
    console.log('Set size:', setSize);
    console.log('Hand:', hand);
    console.log('Club list:', clubList);

    // Create descriptive title based on components
    const clubCount = clubList ? JSON.parse(clubList).length : 0;
    const componentCount = group.length;

    // Check for shaft component to include in title
    const shaftComponent = group.find((item) => item.componentType?.value === 'shaft');
    const shaftInfo = shaftComponent?.shaftBrand?.value || firstItem.shaftName?.value;

    let title = `${hand} Handed ${setSize} Iron Set`;
    if (clubCount > 0) {
      title += ` (${clubCount} clubs)`;
    }
    if (shaftInfo) {
      title += ` with ${shaftInfo}`;
    }
    if (componentCount > 1) {
      title += ` - ${componentCount} components`;
    }

    console.log('Bundle title:', title);

    const parentVariantId = firstItem.parentVariantId?.value;

    if (!parentVariantId) {
      console.error(
        '❌ No parent variant ID found in cart properties - bundle parent product must be configured in theme settings'
      );
      throw new Error(
        'Parent variant ID missing from cart properties - please configure bundle parent product in theme editor'
      );
    }

    console.log('🎯 Using parent variant ID:', parentVariantId);
    console.log('🎯 Source: Theme Settings (via cart properties)');

    return {
      linesMerge: {
        cartLines: group.map((line) => ({
          cartLineId: line.id,
          quantity: line.quantity,
        })),
        title: title,
        parentVariantId: parentVariantId,
      },
    };
  });

  console.log('Total operations:', operations.length);
  console.log('=== Cart Transformer Complete v4.2 ===');

  return {
    operations,
  };
}
