import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push, onValue } from 'firebase/database';
import { realTimeDatabase } from '../lib/firebase';
import { Coffee } from '../models/Coffee';
import { CoffeeUtils } from '../utils/CoffeeUtils';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

export default function AddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    image: '',
    imageFile: null,
    imagePreview: '',
    prices: [{ size: '', price: '' }] // Array of size-price pairs
  });
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);

  // Fetch categories and sizes from Firebase
  useEffect(() => {
    const categoriesRef = ref(realTimeDatabase, 'category');
    const sizesRef = ref(realTimeDatabase, 'sizes');

    // Fetch categories
    const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const categoriesArray = Object.keys(data).map(key => ({
          id: key,
          name: data[key].name || data[key]
        }));
        setCategories(categoriesArray);
      } else {
        setCategories([
          { id: '1', name: 'Hot' },
          { id: '2', name: 'Cold' },
        ]);
      }
    });

    // Fetch sizes
    const unsubscribeSizes = onValue(sizesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sizesArray = Object.keys(data).map(key => ({
          id: key,
          name: data[key].name || data[key]
        }));
        setSizes(sizesArray);
      } else {
        // Default sizes if none exist in Firebase
        setSizes([
          { id: '1', name: 'Small' },
          { id: '2', name: 'Medium' },
          { id: '3', name: 'Large' },
          { id: '4', name: 'Extra Large' }
        ]);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeCategories();
      unsubscribeSizes();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceChange = (index, field, value) => {
    const newPrices = [...formData.prices];
    newPrices[index][field] = value;
    setFormData(prev => ({
      ...prev,
      prices: newPrices
    }));
  };

  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || '');
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

  const uploadImageToImgbb = async (file) => {
    if (!IMGBB_API_KEY) {
      throw new Error('IMGBB API key is not configured. Set VITE_IMGBB_API_KEY in .env');
    }

    const dataUrl = await readFileAsDataUrl(file);
    const base64Data = dataUrl.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
    const body = new FormData();
    body.append('image', base64Data);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'Image upload failed');
    }
    return data.data.url;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      imageFile: file,
      imagePreview: preview,
      image: ''
    }));
  };

  const addPriceField = () => {
    setFormData(prev => ({
      ...prev,
      prices: [...prev.prices, { size: '', price: '' }]
    }));
  };

  const removePriceField = (index) => {
    if (formData.prices.length > 1) {
      const newPrices = formData.prices.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        prices: newPrices
      }));
    }
  };

  const seedDefaultCategories = async () => {
    const defaultCategories = [
      { name: 'Hot' },
      { name: 'Cold' },
    ];

    const categoriesRef = ref(realTimeDatabase, 'category');

    try {
      for (const category of defaultCategories) {
        await push(categoriesRef, category);
      }
      alert('Default categories added to Firebase!');
    } catch (error) {
      console.error('Error seeding categories:', error);
      alert('Failed to add categories');
    }
  };

  const seedDefaultSizes = async () => {
    const defaultSizes = [
      { name: 'Small' },
      { name: 'Medium' },
      { name: 'Large' },
      { name: 'Extra Large' }
    ];

    const sizesRef = ref(realTimeDatabase, 'sizes');

    try {
      for (const size of defaultSizes) {
        await push(sizesRef, size);
      }
      alert('Default sizes added to Firebase!');
    } catch (error) {
      console.error('Error seeding sizes:', error);
      alert('Failed to add sizes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    let imageData = formData.image;
    if (formData.imageFile) {
      try {
        setImageUploading(true);
        imageData = await uploadImageToImgbb(formData.imageFile);
      } catch (error) {
        setErrors([`Image upload failed: ${error.message}`]);
        setImageUploading(false);
        return;
      } finally {
        setImageUploading(false);
      }
    }

    if (!imageData) {
      setErrors(['Coffee image is required']);
      return;
    }

    // Convert prices array to object format
    const priceObject = {};
    formData.prices.forEach(({ size, price }) => {
      if (size && price) {
        priceObject[size] = parseFloat(price);
      }
    });

    // Create Coffee model instance
    const newCoffee = new Coffee({
      name: formData.name,
      category: formData.category,
      description: formData.description,
      image: imageData,
      sizes: priceObject // Use 'sizes' to match Firebase structure
    });

    // Validate the coffee data
    const validation = CoffeeUtils.validateCoffee(newCoffee);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      // Save to Firebase
      const menuRef = ref(realTimeDatabase, 'menu');
      const coffeeObject = CoffeeUtils.toFirebaseObject(newCoffee);
      await push(menuRef, coffeeObject);

      // Navigate back to products page
      navigate('/products');
    } catch (error) {
      console.error('Error adding coffee:', error);
      setErrors([`Failed to add coffee: ${error.message || 'Unknown error'}`]);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Add New Coffee</h1>

      {categories.length === 0 && !loading && (
        <div style={{
          backgroundColor: '#e3f2fd',
          border: '1px solid #2196f3',
          color: '#1976d2',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '4px'
        }}>
          <p>No categories found. <button
            type="button"
            onClick={seedDefaultCategories}
            style={{
              background: 'none',
              border: 'none',
              color: '#1976d2',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: 'inherit'
            }}
          >
            Click here to add default categories
          </button></p>
        </div>
      )}

      {sizes.length === 0 && !loading && (
        <div style={{
          backgroundColor: '#e3f2fd',
          border: '1px solid #2196f3',
          color: '#1976d2',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '4px'
        }}>
          <p>No sizes found. <button
            type="button"
            onClick={seedDefaultSizes}
            style={{
              background: 'none',
              border: 'none',
              color: '#1976d2',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: 'inherit'
            }}
          >
            Click here to add default sizes
          </button></p>
        </div>
      )}

      {errors.length > 0 && (
        <div style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          color: '#c33',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '4px'
        }}>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Name:
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Category:
          </label>
          {loading ? (
            <div style={{ padding: '8px', color: '#666' }}>Loading categories...</div>
          ) : (
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Description:
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Coffee Image:
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          {(formData.imagePreview || formData.image) && (
            <img
              src={formData.imagePreview || formData.image}
              alt="Coffee preview"
              style={{ marginTop: '12px', width: '100%', maxHeight: '240px', borderRadius: '8px', objectFit: 'cover' }}
            />
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Prices (Size: Price):
          </label>

          {formData.prices.map((price, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
              <select
                value={price.size}
                onChange={(e) => handlePriceChange(index, 'size', e.target.value)}
                style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">Select size</option>
                {sizes.map((size) => (
                  <option key={size.id} value={size.name}>
                    {size.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={price.price}
                onChange={(e) => handlePriceChange(index, 'price', e.target.value)}
                style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              {formData.prices.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePriceField(index)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addPriceField}
            style={{
              padding: '8px 16px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            + Add Another Size
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={imageUploading}
            style={{
              padding: '10px 20px',
              backgroundColor: imageUploading ? '#9ca3af' : '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: imageUploading ? 'not-allowed' : 'pointer'
            }}
          >
            {imageUploading ? 'Uploading image...' : 'Add Coffee'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}