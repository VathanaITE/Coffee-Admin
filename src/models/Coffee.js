// Coffee model class to structure data from Firebase
export class Coffee {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.category = data.category || '';
    this.sizes = data.sizes || {}; // Object with size: price pairs (matches Firebase structure)
    this.description = data.description || '';
    this.image = data.image || '';
  }

  // Get all available sizes
  getSizes() {
    return Object.keys(this.sizes);
  }

  // Get price for a specific size
  getPrice(size) {
    return this.sizes[size] || 0;
  }

  // Get formatted price display (size: $price)
  getFormattedPrices() {
    if (!this.sizes || typeof this.sizes !== 'object') {
      return 'No prices set';
    }

    return Object.entries(this.sizes)
      .map(([size, price]) => `${size}: $${parseFloat(price).toFixed(2)}`)
      .join('\n');
  }

  // Get the lowest price
  getLowestPrice() {
    const prices = Object.values(this.sizes).map(p => parseFloat(p));
    return prices.length > 0 ? Math.min(...prices) : 0;
  }

  // Get the highest price
  getHighestPrice() {
    const prices = Object.values(this.sizes).map(p => parseFloat(p));
    return prices.length > 0 ? Math.max(...prices) : 0;
  }

  // Check if coffee has multiple sizes
  hasMultipleSizes() {
    return Object.keys(this.sizes).length > 1;
  }

  // Convert to plain object for Firebase
  toFirebaseObject() {
    return {
      name: this.name,
      category: this.category,
      sizes: this.sizes, // Use 'sizes' to match Firebase structure
      description: this.description,
      image: this.image,
    };
  }
}