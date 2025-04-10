import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  
  // Define Product interface
  interface Product {
    id: number;
    name: string;
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
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'create'>('list')
  
  const API_BASE_URL = 'https://render-rails-2yoa.onrender.com';

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
        body: JSON.stringify({ name: newProductName }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setApiData(data);
      setNewProductName('');
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
      
      const data = await response.json();
      setApiData(data);
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
  }, []);

  // Render UI based on current view
  const renderContent = () => {
    if (loading) {
      return <p>Loading data...</p>;
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
                    {product.name}
                    <button onClick={() => getProductById(product.id)}>View</button>
                    <button onClick={() => deleteProduct(product.id)}>Delete</button>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setCurrentView('create')}>Add New Product</button>
          </div>
        );
      
      case 'detail':
        return selectedProduct ? (
          <div className="product-detail">
            <h2>Product Details</h2>
            <p><strong>ID:</strong> {selectedProduct.id}</p>
            <p><strong>Name:</strong> {selectedProduct.name}</p>
            <p><strong>Created:</strong> {new Date(selectedProduct.created_at).toLocaleString()}</p>
            <p><strong>Updated:</strong> {new Date(selectedProduct.updated_at).toLocaleString()}</p>
            <button onClick={() => setCurrentView('list')}>Back to List</button>
            <button onClick={() => deleteProduct(selectedProduct.id)}>Delete</button>
          </div>
        ) : (
          <p>Product not found</p>
        );
      
      case 'create':
        return (
          <div className="create-product">
            <h2>Create New Product</h2>
            <form onSubmit={createProduct}>
              <div>
                <label htmlFor="productName">Product Name:</label>
                <input 
                  type="text" 
                  id="productName"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  required
                />
              </div>
              <button type="submit">Create Product</button>
              <button type="button" onClick={() => setCurrentView('list')}>Cancel</button>
            </form>
          </div>
        );
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Product Management System</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        
        {/* Product Management UI */}
        <div className="product-management">
          {renderContent()}
        </div>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
