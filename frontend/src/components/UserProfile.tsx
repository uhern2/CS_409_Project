// UserProfile.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface UserProfileProps {
  user: { name: string; email: string };
  authToken: string;
  onLogout: () => void;
  refreshSignal?: number; // optional prop to trigger refresh
}

interface UserProfileData {
  name: string;
  email: string;
  totalBooksLogged: number;
  averageRating: number | null;
}

const API_BASE_URL = 'http://localhost:4000';

export function UserProfile({ user: initialUser, authToken, onLogout }: UserProfileProps) {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-fetch profile when component mounts or refreshSignal changes
  useEffect(() => {
    fetchProfileData();
  }, [refreshSignal]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [profileRes, logsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch(`${API_BASE_URL}/logs/me`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);

      if (!profileRes.ok) {
        throw new Error('Failed to fetch profile data');
      }
      const profile = await profileRes.json();

      let totalBooksLogged = 0;
      let averageRating: number | null = null;

      if (logsRes.ok) {
        const logs = await logsRes.json();
        totalBooksLogged = Array.isArray(logs) ? logs.length : 0;
        const ratings = Array.isArray(logs) ? logs.map((l: any) => l.rating).filter((r: any) => typeof r === 'number') : [];
        if (ratings.length > 0) {
          averageRating = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
        }
      }

      setProfileData({
        name: profile.name ?? initialUser.name,
        email: profile.email ?? initialUser.email,
        totalBooksLogged,
        averageRating,
      });
      setEditedName(profile.name ?? initialUser.name);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
      setProfileData({
        name: initialUser.name,
        email: initialUser.email,
        totalBooksLogged: 0,
        averageRating: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      setError('Name cannot be empty');
      return;
    }
    try {
      setIsSaving(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editedName.trim() }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      const updatedData = await response.json();
      setProfileData(updatedData);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profileData) setEditedName(profileData.name);
    setIsEditing(false);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  const displayData = profileData || {
    name: initialUser.name,
    email: initialUser.email,
    totalBooksLogged: 0,
    averageRating: null,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/dashboard')} className="flex items-center hover:opacity-80 transition-opacity cursor-pointer">
              <h1 className="text-2xl text-indigo-900">BookLog</h1>
            </button>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
              <Button variant="ghost" onClick={onLogout}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">User Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>}

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Name</label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} placeholder="Enter your name" className="flex-1" />
                  <Button onClick={handleSaveName} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
                  <Button onClick={handleCancelEdit} variant="outline" disabled={isSaving}>Cancel</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-lg text-gray-900">{displayData.name}</div>
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">Edit</Button>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="text-lg text-gray-900">{displayData.email}</div>
            </div>

            {/* Stats */}
            <div className="border-t pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Total Books Logged</label>
                <div className="text-2xl font-semibold text-indigo-600">{displayData.totalBooksLogged}</div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Average Rating</label>
                <div className="text-2xl font-semibold text-indigo-600">
                  {displayData.averageRating !== null ? displayData.averageRating.toFixed(2) : 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
