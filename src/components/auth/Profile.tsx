import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = 'http://localhost:3000'; // Change to your Rails API URL

const Profile = () => {
  const { user, token, error: authError, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
    setPassword('');
    setPasswordConfirmation('');
    setError(null);
    setUpdateSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUpdateSuccess(false);
    setError(null);
    // Reset to original values
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
    setPassword('');
    setPasswordConfirmation('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setError(null);
    
    // Check if passwords match when provided
    if (password && password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      
      // Only include password in the payload if it's provided
      const payload: Record<string, string> = { name, email };
      if (password) {
        payload.password = password;
        payload.password_confirmation = passwordConfirmation;
      }
      
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUpdateSuccess(true);
        setIsEditing(false);
        // The user state will be updated automatically via the profile fetch in AuthContext
      } else {
        setError(data.errors ? data.errors.join(', ') : 'Update failed');
      }
    } catch (err) {
      setError('An error occurred while updating your profile');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please login to view your profile.</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Profile</h2>
      
      {updateSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">Profile updated successfully!</span>
        </div>
      )}

      {(error || authError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error || authError}</span>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
          
          {password && (
            <div>
              <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                id="passwordConfirmation"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required={!!password}
              />
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || authLoading}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Name</h3>
            <p className="mt-1 text-sm text-gray-900">{user.name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
          </div>
          
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile; 