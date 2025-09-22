import type { CartTransformRunInput, CartTransformRunResult } from '../generated/api';

export function cartTransformRun(input: CartTransformRunInput): CartTransformRunResult {
  // Use the actual input type from the generated schema
  type CartLineInput = (typeof input.cart.lines)[0];
  const groupedItems: Record<string, CartLineInput[]> = {};

  // Enhanced Bundle Presentation - Version 4.3
  console.log('=== Cart Transformer Started v4.3 (Enhanced Bundle Presentation + Component Breakdown) ===');
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

    // Debug: Analyze all items in the group
    console.log('=== GROUP ANALYSIS ===');
    group.forEach((item, index) => {
      console.log(`Item ${index + 1}:`);
      console.log(`  Component type: ${item.componentType?.value || 'undefined'}`);
      console.log(`  Hand: ${item.hand?.value || 'undefined'}`);
      console.log(`  SetSize: ${item.setSize?.value || 'undefined'}`);
      console.log(`  ClubList: ${item.clubList?.value || 'undefined'}`);
      console.log(`  ParentVariantId: ${item.parentVariantId?.value || 'undefined'}`);
      console.log(`  BundleId: ${item.bundleId?.value || 'undefined'}`);
    });

    // Since all items now have bundle metadata, use the first item
    const firstItem = group[0];

    console.log('=== SELECTED FIRST ITEM (ALL ITEMS HAVE METADATA) ===');
    console.log('Available properties:', Object.keys(firstItem));
    console.log('Selected item component type:', firstItem.componentType?.value || 'undefined');
    console.log('Has metadata - Hand:', !!firstItem.hand?.value, 'SetSize:', !!firstItem.setSize?.value);

    const hand = firstItem.hand?.value || 'Right Handed';
    const setSize = firstItem.setSize?.value || '6-PW';
    // Try both snake_case and camelCase for club list
    const clubList = (firstItem as any).club_list?.value || firstItem.clubList?.value || '';

    console.log('Raw property values:');
    console.log('  hand:', firstItem.hand?.value);
    console.log('  setSize:', firstItem.setSize?.value);
    console.log('  club_list:', (firstItem as any).club_list?.value);
    console.log('  clubList:', firstItem.clubList?.value);

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

    // Create clean bundle title for customer-facing display
    const clubCount = clubList ? JSON.parse(clubList).length : 0;

    // Check for shaft component to include in title
    const shaftComponent = group.find((item) => item.componentType?.value === 'shaft');
    const shaftInfo =
      (shaftComponent as any)?.shaftBrand?.value ||
      (shaftComponent as any)?.shaftTitle?.value ||
      (firstItem as any).shaftName?.value;
    const shaftFlex = (shaftComponent as any)?.shaftFlex?.value;

    // Generate clean, professional bundle title
    let title = `Custom Golf Iron Set - ${setSize}`;

    if (shaftInfo) {
      let shaftDisplay = shaftInfo;
      if (shaftFlex && !shaftInfo.includes(shaftFlex)) {
        shaftDisplay += ` ${shaftFlex}`;
      }
      title += ` with ${shaftDisplay}`;
    }

    // Add club count as subtitle info (not in main title)
    const subtitle = `${clubCount} clubs configured for ${hand.toLowerCase()} hand`;

    console.log('Bundle title:', title);
    console.log('Bundle subtitle:', subtitle);

    const parentVariantId = firstItem.parentVariantId?.value;

    console.log('Raw parentVariantId property:', firstItem.parentVariantId?.value);

    if (!parentVariantId) {
      console.error(
        '❌ No parent variant ID found in cart properties - bundle parent product must be configured in theme settings'
      );
      console.error('All available properties for debugging:', firstItem);
      throw new Error(
        'Parent variant ID missing from cart properties - please configure bundle parent product in theme editor'
      );
    }

    console.log('🎯 Using parent variant ID:', parentVariantId);
    console.log('🎯 Source: Theme Settings (via cart properties)');

    // Create component breakdown for bundle description
    const components = group.map((item) => {
      const componentType = item.componentType?.value || 'main';
      const bundleSummary = (item as any)._bundle_summary?.value;
      return bundleSummary || `${componentType} component`;
    });

    const bundleDescription = `Complete golf set: ${components.join(' + ')}`;
    console.log('Bundle description:', bundleDescription);

    return {
      linesMerge: {
        cartLines: group.map((line) => ({
          cartLineId: line.id,
          quantity: line.quantity,
        })),
        title: title,
        parentVariantId: parentVariantId,
        attributes: [
          {
            key: '_bundle_type',
            value: 'golf_configurator',
          },
          {
            key: '_bundle_description',
            value: bundleDescription,
          },
          {
            key: '_bundle_hand',
            value: hand,
          },
          {
            key: '_bundle_clubs',
            value: clubCount.toString(),
          },
          {
            key: '_bundle_set_size',
            value: setSize,
          },
        ],
      },
    };
  });

  console.log('Total operations:', operations.length);
  console.log('=== Cart Transformer Complete v4.3 ===');

  return {
    operations,
  };
}
