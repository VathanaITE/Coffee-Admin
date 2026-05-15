import { Coffee } from '../models/Coffee';

/**
 * Utility functions for working with Firebase data and Coffee models
 */
export class CoffeeUtils {
  /**
   * Convert Firebase snapshot data to Coffee model instances
   * @param {Object} snapshotData - Firebase snapshot.val() data
   * @returns {Coffee[]} Array of Coffee model instances
   */
  static fromFirebaseData(snapshotData) {
    if (!snapshotData) return [];

    return Object.keys(snapshotData).map(key => {
      const coffeeData = { id: key, ...snapshotData[key] };
      return new Coffee(coffeeData);
    });
  }

  /**
   * Convert Coffee model to Firebase-compatible object (without id)
   * @param {Coffee} coffee - Coffee model instance
   * @returns {Object} Firebase-compatible object
   */
  static toFirebaseObject(coffee) {
    return coffee.toFirebaseObject();
  }

  /**
   * Validate coffee data before saving to Firebase
   * @param {Coffee} coffee - Coffee model instance
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  static validateCoffee(coffee) {
    const errors = [];

    if (!coffee.name || coffee.name.trim() === '') {
      errors.push('Name is required');
    }

    if (!coffee.category || coffee.category.trim() === '') {
      errors.push('Category is required');
    }

    if (!coffee.sizes || Object.keys(coffee.sizes).length === 0) {
      errors.push('At least one size with price is required');
    } else {
      // Validate price values
      Object.entries(coffee.sizes).forEach(([size, price]) => {
        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice <= 0) {
          errors.push(`Invalid price for ${size}: must be a positive number`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}