import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  // const [count, setCount] = useState(0)
  
  // Define Product interface
  interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    category?: string;
    created_at: string;
    updated_at: string;
  }
  
  interface ApiResponse {
    message: string;
    data?: Record<string, unknown>;
  }

  // State variables
  const [  , setApiData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [newProductName, setNewProductName] = useState('')
  const [newProductPrice, setNewProductPrice] = useState('')
  const [newProductDescription, setNewProductDescription] = useState('')
  const [newProductCategory, setNewProductCategory] = useState('')
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'create'>('list')
  
  // Configure API URL - Set this to false for production
  const useLocalServer = true;
  const API_BASE_URL = useLocalServer ? 'http://localhost:3000' : 'https://render-rails-2yoa.onrender.com';

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch products: ${err instanceof Error ? err.message : String(err)}`);
      console.error('API fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get product by ID
  const getProductById = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setSelectedProduct(data);
      setCurrentView('detail');
      setError(null);
    } catch (err) {
      setError(`Failed to fetch product: ${err instanceof Error ? err.message : String(err)}`);
      console.error('API fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new product
  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          product: { 
            name: newProductName,
            price: parseFloat(newProductPrice) || 0,
            description: newProductDescription,
            category: newProductCategory
          } 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setApiData(data);
      setNewProductName('');
      setNewProductPrice('');
      setNewProductDescription('');
      setNewProductCategory('');
      setCurrentView('list');
      fetchProducts(); // Refresh the product list
      setError(null);
    } catch (err) {
      setError(`Failed to create product: ${err instanceof Error ? err.message : String(err)}`);
      console.error('API create error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete product by ID
  const deleteProduct = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // No need to parse response as the server returns no content
      setCurrentView('list');
      fetchProducts(); // Refresh the product list
      setError(null);
    } catch (err) {
      setError(`Failed to delete product: ${err instanceof Error ? err.message : String(err)}`);
      console.error('API delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchProducts();
 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render UI based on current view
  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading data...</div>;
    }
    
    if (error) {
      return <p className="error">{error}</p>;
    }
    
    switch (currentView) {
      case 'list':
        return (
          <div className="products-list">
            <h2>Products</h2>
            {products.length === 0 ? (
              <p>No products found.</p>
            ) : (
              <ul>
                {products.map(product => (
                  <li key={product.id}>
                    <span className="product-name">{product.name}</span>
                    <span className="product-price">${Number(product.price).toFixed(2)}</span>
                    <div className="action-buttons">
                      <button className="primary" onClick={() => getProductById(product.id)}>View</button>
                      <button className="danger" onClick={() => deleteProduct(product.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="form-buttons">
              <button className="success" onClick={() => setCurrentView('create')}>Add New Product</button>
            </div>
          </div>
        );
      
      case 'detail':
        return selectedProduct ? (
          <div className="product-detail">
            <h2>Product Details</h2>
            <div className="detail-row">
              <span className="detail-label">ID:</span>
              <span className="detail-value">{selectedProduct.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{selectedProduct.name}</span>
            </div>
            {selectedProduct.description && (
              <div>
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                </div>
                <div className="detail-description">
                  {selectedProduct.description}
                </div>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Price:</span>
              <span className="detail-value">${Number(selectedProduct.price).toFixed(2)}</span>
            </div>
            {selectedProduct.category && (
              <div className="detail-row">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{selectedProduct.category}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Created:</span>
              <span className="detail-value">{new Date(selectedProduct.created_at).toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Updated:</span>
              <span className="detail-value">{new Date(selectedProduct.updated_at).toLocaleString()}</span>
            </div>
            <div className="form-buttons">
              <button className="secondary" onClick={() => setCurrentView('list')}>Back to List</button>
              <button className="danger" onClick={() => deleteProduct(selectedProduct.id)}>Delete</button>
            </div>
          </div>
        ) : (
          <p>Product not found</p>
        );
      
      case 'create':
        return (
          <div className="create-product">
            <h2>Create New Product</h2>
            <form onSubmit={createProduct}>
              <div className="form-group">
                <label htmlFor="productName">Product Name:</label>
                <input 
                  type="text" 
                  id="productName"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="productPrice">Price:</label>
                <input 
                  type="number" 
                  id="productPrice"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="productDescription">Description:</label>
                <textarea 
                  id="productDescription"
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="productCategory">Category:</label>
                <input 
                  type="text" 
                  id="productCategory"
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value)}
                />
              </div>
              <div className="form-buttons">
                <button type="submit" className="success">Create Product</button>
                <button type="button" className="secondary" onClick={() => setCurrentView('list')}>Cancel</button>
              </div>
            </form>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Product Management System</h1>
      </header>
      
      <main className="content-container">
        {renderContent()}
      </main>
      
      <footer className="app-footer">
        <p>Product Management System - Built with React and Vite</p>
      </footer>
    </div>
  );
}

export default App
