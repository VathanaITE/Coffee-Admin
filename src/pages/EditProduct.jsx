import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, update, onValue } from 'firebase/database';
import { realTimeDatabase } from '../lib/firebase';
import { Coffee } from '../models/Coffee';
import { CoffeeUtils } from '../utils/CoffeeUtils';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

export default function EditProduct() {
  const navigate = useNavigate();
  const { coffeeId } = useParams();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    image: '',
    imageFile: null,
    imagePreview: '',
    prices: [{ size: '', price: '' }]
  });
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    const categoriesRef = ref(realTimeDatabase, 'category');
    const sizesRef = ref(realTimeDatabase, 'sizes');

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
          { id: '2', name: 'Cold' }
        ]);
      }
    });

    const unsubscribeSizes = onValue(sizesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sizesArray = Object.keys(data).map(key => ({
          id: key,
          name: data[key].name || data[key]
        }));
        setSizes(sizesArray);
      } else {
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

  useEffect(() => {
    if (!coffeeId) return;

    const coffeeRef = ref(realTimeDatabase, `menu/${coffeeId}`);
    const unsubscribe = onValue(coffeeRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setErrors(['Coffee product not found']);
        return;
      }

      const prices = data.sizes && typeof data.sizes === 'object'
        ? Object.entries(data.sizes).map(([size, price]) => ({ size, price: String(price) }))
        : [{ size: '', price: '' }];

      setFormData({
        name: data.name || '',
        category: data.category || '',
        description: data.description || '',
        image: data.image || '',
        imagePreview: data.image || '',
        imageFile: null,
        prices: prices.length > 0 ? prices : [{ size: '', price: '' }]
      });
    });

    return () => unsubscribe();
  }, [coffeeId]);

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

    const priceObject = {};
    formData.prices.forEach(({ size, price }) => {
      if (size && price) {
        priceObject[size] = parseFloat(price);
      }
    });

    const updatedCoffee = new Coffee({
      name: formData.name,
      category: formData.category,
      description: formData.description,
      image: imageData,
      sizes: priceObject
    });

    const validation = CoffeeUtils.validateCoffee(updatedCoffee);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const coffeeRef = ref(realTimeDatabase, `menu/${coffeeId}`);
      await update(coffeeRef, CoffeeUtils.toFirebaseObject(updatedCoffee));
      navigate('/products');
    } catch (error) {
      console.error('Error updating coffee:', error);
      setErrors([`Failed to update coffee: ${error.message || 'Unknown error'}`]);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Edit Coffee</h1>

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
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          {formData.image && (
            <img
              src={formData.image}
              alt="Coffee preview"
              style={{ marginTop: '12px', width: '100%', maxHeight: '240px', borderRadius: '8px', objectFit: 'cover' }}
            />
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontWeight: 'bold' }}>Prices</label>
            <button type="button" onClick={addPriceField} style={{ backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer' }}>
              + Add Size
            </button>
          </div>
          {formData.prices.map((priceObj, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '10px', marginBottom: '10px' }}>
              <select
                value={priceObj.size}
                onChange={(e) => handlePriceChange(index, 'size', e.target.value)}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
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
                placeholder="Price"
                value={priceObj.price}
                onChange={(e) => handlePriceChange(index, 'price', e.target.value)}
                required
                min="0"
                step="0.01"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <button
                type="button"
                onClick={() => removePriceField(index)}
                style={{ marginLeft: '20px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', padding: '8px', cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" disabled={imageUploading} style={{ backgroundColor: imageUploading ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 20px', cursor: imageUploading ? 'not-allowed' : 'pointer' }}>
            {imageUploading ? 'Uploading image...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate('/products')} style={{ backgroundColor: '#9ca3af', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 20px', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
