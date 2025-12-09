import { useState } from 'react';
import { BookOpen, Search, Library, LogOut, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { MyBooks } from './MyBooks';
import { SearchBooks } from './SearchBooks';
import { mockLoggedBooks } from '../data/mockBooks';
import { LoggedBook } from '../types/book';
import { useNavigate } from 'react-router-dom';

interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

interface DashboardProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

type View = 'mybooks' | 'search';

export function Dashboard({ user, onLogout }: DashboardProps) {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<View>('mybooks');
  const [loggedBooks, setLoggedBooks] = useState<LoggedBook[]>(mockLoggedBooks);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  const handleAddBook = (newBook: LoggedBook) => {
    setLoggedBooks([newBook, ...loggedBooks]);
    setCurrentView('mybooks');
  };

  const handleDeleteBook = (bookId: string) => {
    setLoggedBooks(loggedBooks.filter(book => book.id !== bookId));
  };

  const handleUpdateBook = (bookId: string, updates: {
    startDate: string;
    finishDate: string;
    review: string;
    rating: number;
  }) => {
    setLoggedBooks(prevBooks => 
      prevBooks.map(book => 
        book.id === bookId 
          ? { ...book, ...updates }
          : book
      )
    );
  };

  const handleAddReview = (review: Review) => {
    setReviews(prevReviews => [review, ...prevReviews]);
  };

  const handleUpdateReview = (reviewId: string, updates: { rating: number; text: string }) => {
    setReviews(prevReviews =>
      prevReviews.map(r =>
        r.id === reviewId
          ? { ...r, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
          : r
      )
    );
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews(prevReviews => prevReviews.filter(r => r.id !== reviewId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-indigo-600 mr-2" />
              <h1 className="text-2xl text-indigo-900">BookLog</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setCurrentView('mybooks')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition ${
                  currentView === 'mybooks'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Library className="w-5 h-5" />
                <span>My Books</span>
              </button>
              <button
                onClick={() => setCurrentView('search')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition ${
                  currentView === 'search'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Search className="w-5 h-5" />
                <span>Search Books</span>
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="hidden sm:block text-right hover:opacity-80 transition-opacity cursor-pointer"
              >
                <p className="text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </button>
              <Button variant="ghost" onClick={onLogout} className="hidden md:flex items-center">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 space-y-2">
              <button
                onClick={() => {
                  setCurrentView('mybooks');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md transition ${
                  currentView === 'mybooks'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Library className="w-5 h-5" />
                <span>My Books</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('search');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md transition ${
                  currentView === 'search'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Search className="w-5 h-5" />
                <span>Search Books</span>
              </button>
              <Button
                variant="ghost"
                onClick={onLogout}
                className="w-full flex items-center justify-start"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'mybooks' && (
          <MyBooks 
            loggedBooks={loggedBooks} 
            currentUserId="current-user-id"
            currentUserName={user.name}
            reviews={reviews}
            onDeleteBook={handleDeleteBook}
            onUpdateBook={handleUpdateBook}
            onAddReview={handleAddReview}
            onUpdateReview={handleUpdateReview}
            onDeleteReview={handleDeleteReview}
          />
        )}
        {currentView === 'search' && (
          <SearchBooks 
            onAddBook={handleAddBook} 
            loggedBooks={loggedBooks}
            currentUserId="current-user-id"
            currentUserName={user.name}
            reviews={reviews}
            onAddReview={handleAddReview}
            onUpdateReview={handleUpdateReview}
            onDeleteReview={handleDeleteReview}
          />
        )}
      </main>
    </div>
  );
}