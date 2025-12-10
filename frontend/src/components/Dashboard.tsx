import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Library, LogOut, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { MyBooks } from './MyBooks';
import { SearchBooks } from './SearchBooks';
import { LoggedBook } from '../types/book';

interface DashboardProps {
  user: { name: string; email: string };
  authToken: string;
  onLogout: () => void;
}

type View = 'mybooks' | 'search';

export function Dashboard({ user, authToken, onLogout }: DashboardProps) {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<View>('mybooks');
  const [loggedBooks, setLoggedBooks] = useState<LoggedBook[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchLoggedBooks() {
      if (!authToken) return;
      try {
        const res = await fetch('http://localhost:4000/logs/me', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data: LoggedBook[] = await res.json();
        setLoggedBooks(data);
      } catch (err) {
        console.error('Error fetching logged books:', err);
      }
    }

    fetchLoggedBooks();
  }, [authToken]);

  const handleAddBook = async (newBook: LoggedBook) => {
    try {
      let bookId = newBook.id;

      // If the book id doesn't look like a Mongo ObjectId, try importing it first
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(bookId);
      if (!isObjectId) {
        const importRes = await fetch('http://localhost:4000/books/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            googleBooksId: newBook.id,
            title: newBook.title,
            author: newBook.author,
            genre: newBook.genre,
            yearPublished: newBook.yearPublished,
            coverUrl: newBook.coverUrl,
            description: newBook.description,
            pages: newBook.pages,
          }),
        });

        if (!importRes.ok) {
          throw new Error(`Import failed with status ${importRes.status}`);
        }

        const imported = await importRes.json();
        bookId = imported.id;
      }

      const res = await fetch('http://localhost:4000/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          bookId,
          startDate: newBook.startDate,
          finishDate: newBook.finishDate,
          rating: newBook.rating,
          reviewText: newBook.review,
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const created: LoggedBook = await res.json();
      setLoggedBooks(prev => [created, ...prev]);
      setCurrentView('mybooks');
    } catch (err) {
      console.error('Error creating log:', err);
      alert('Failed to save log. Please try again.');
    }
  };

  const handleDeleteBook = async (logId: string) => {
    // Optimistically update UI but keep snapshot to restore on failure
    const snapshot = loggedBooks;
    setLoggedBooks(prev => prev.filter(book => book.logId !== logId));

    try {
      const res = await fetch(`http://localhost:4000/logs/${logId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
    } catch (err) {
      console.error('Error deleting log:', err);
      // Revert UI if delete fails
      if (snapshot.length) {
        setLoggedBooks(snapshot);
      }
    }
  };

  const handleUpdateBook = (logId: string, updates: {
    startDate: string;
    finishDate: string;
    review: string;
    rating: number;
  }) => {
    // Optimistic update
    const snapshot = loggedBooks;
    setLoggedBooks(prevBooks => 
      prevBooks.map(book => 
        book.logId === logId 
          ? { ...book, ...updates }
          : book
      )
    );

    fetch(`http://localhost:4000/logs/${logId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        startDate: updates.startDate,
        finishDate: updates.finishDate,
        rating: updates.rating,
        reviewText: updates.review,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const updated: LoggedBook = await res.json();
        setLoggedBooks(prevBooks =>
          prevBooks.map(book => book.logId === logId ? updated : book)
        );
      })
      .catch((err) => {
        console.error('Error updating log:', err);
        alert('Failed to update log. Reverting changes.');
        setLoggedBooks(snapshot);
      });
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
            authToken={authToken}
            onDeleteBook={handleDeleteBook}
            onUpdateBook={handleUpdateBook}
          />
        )}
        {currentView === 'search' && (
          <SearchBooks onAddBook={handleAddBook} loggedBooks={loggedBooks} authToken={authToken} />
        )}
      </main>
    </div>
  );
}
