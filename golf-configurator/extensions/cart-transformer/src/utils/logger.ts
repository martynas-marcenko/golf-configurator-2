/**
 * Centralized logging utility for cart transformer
 * Consistent logging patterns with different levels
 */

import type { TypedCartLine } from '../types/bundle-types';

export class Logger {
  private static readonly VERSION = 'v4.4';
  private static readonly PREFIX = 'Cart Transformer';

  /**
   * Log transformation start
   */
  static start(lineCount: number): void {
    console.log(`=== ${this.PREFIX} Started ${this.VERSION} (DRY Architecture + Fail-Fast Validation) ===`);
    console.log('Cart lines:', lineCount);
    console.log('Timestamp:', new Date().toISOString());
  }

  /**
   * Log transformation completion
   */
  static complete(operationCount: number): void {
    console.log('Total operations:', operationCount);
    console.log(`=== ${this.PREFIX} Complete ${this.VERSION} ===`);
  }

  /**
   * Log bundle processing
   */
  static bundleProcessing(bundleId: string, itemCount: number): void {
    console.log(`Creating merge for bundle: ${bundleId} with ${itemCount} items`);
  }

  /**
   * Log bundle grouping results
   */
  static bundleGroups(groupIds: string[]): void {
    console.log('Groups created:', groupIds.length);
    console.log('Group IDs:', groupIds);
  }

  /**
   * Log individual line processing
   */
  static lineProcessing(index: number, lineId: string, bundleId?: string): void {
    console.log(`Processing line ${index + 1}: ${lineId}`);
    if (bundleId) {
      console.log('Using group ID:', bundleId);
    } else {
      console.log('Line has no bundleId, skipping transformation');
    }
  }

  /**
   * Log component analysis
   */
  static componentAnalysis(group: TypedCartLine[]): void {
    console.log('=== COMPONENT ANALYSIS ===');
    group.forEach((item, index) => {
      const componentType = item.componentType?.value || 'undefined';
      const merchandiseId = item.merchandise.__typename === 'ProductVariant' ? item.merchandise.id : 'N/A';
      console.log(
        `  Component ${index + 1}: ${componentType} (${merchandiseId}) - ${item.cost.amountPerQuantity.amount} ${item.cost.amountPerQuantity.currencyCode}`
      );
    });
  }

  /**
   * Log metadata extraction
   */
  static metadataExtraction(item: TypedCartLine): void {
    console.log('=== METADATA EXTRACTION ===');
    console.log('Available properties:', Object.keys(item));
    console.log('Component type:', item.componentType?.value || 'undefined');
    console.log('Hand:', item.hand?.value || 'undefined');
    console.log('SetSize:', item.setSize?.value || 'undefined');
    console.log('ClubList:', item.clubList?.value || item.club_list?.value || 'undefined');
    console.log('ParentVariantId:', item.parentVariantId?.value || 'undefined');
    console.log('BundleId:', item.bundleId?.value || 'undefined');
  }

  /**
   * Log bundle results
   */
  static bundleResults(title: string, price: number, currency: string, clubCount: number): void {
    console.log('Bundle title:', title);
    console.log('Total bundle price:', price, currency);
    console.log('Club count:', clubCount);
  }

  /**
   * Log parent variant usage
   */
  static parentVariant(parentVariantId: string): void {
    console.log('🎯 Using parent variant ID:', parentVariantId);
    console.log('🎯 Source: Theme Settings (via cart properties)');
  }

}