import { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Sparkles, TrendingUp, Star } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Book, LoggedBook } from '../types/book';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { LogBookDialog } from './LogBookDialog';
import { BookDetailModal } from './BookDetailModal';

interface SearchBooksProps {
  onAddBook: (book: LoggedBook) => void;
  loggedBooks: LoggedBook[];
  authToken?: string;
}

export function SearchBooks({ onAddBook, loggedBooks, authToken }: SearchBooksProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [mode, setMode] = useState<'explore' | 'searching'>('explore');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<Book | LoggedBook | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('http://localhost:4000/books');
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data: Book[] = await res.json();
        setBooks(data);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  // Get unique genres and authors
  const genres = Array.from(new Set(books.map(book => book.genre)));
  const authors = Array.from(new Set(books.map(book => book.author))).sort();

  // Check if user is actively searching/filtering
  const hasActiveFilters = filterGenre !== 'all' || filterAuthor !== 'all' || yearFrom || yearTo;
  const isSearching = searchQuery.trim() !== '' || hasActiveFilters;

  // Update mode based on search state
  useEffect(() => {
    setMode(isSearching ? 'searching' : 'explore');
  }, [isSearching]);

  // Get recommendations (mock logic - you can make this smarter)
  const getRecommendations = () => {
    // Get user's favorite genres from logged books
    const userGenres = loggedBooks.map(book => book.genre);
    const genreCounts = userGenres.reduce((acc, genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteGenre = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a])[0];

    // Filter out already logged books
    const unloggedBooks = books.filter(book => !isBookLogged(book.id));

    // Recommendations based on favorite genre
    const genreRecs = favoriteGenre 
      ? unloggedBooks.filter(book => book.genre === favoriteGenre).slice(0, 4)
      : [];

    // Popular/Trending books (newest books)
    const trending = unloggedBooks
      .sort((a, b) => b.yearPublished - a.yearPublished)
      .slice(0, 4);

    // Highly rated (mock - you could add ratings to books)
    const popular = unloggedBooks
      .slice(0, 4);

    return {
      forYou: genreRecs,
      trending,
      popular
    };
  };

  // Filter and sort books for search mode
  const getSearchResults = () => {
    let filtered = books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           book.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = filterGenre === 'all' || book.genre === filterGenre;
      const matchesAuthor = filterAuthor === 'all' || book.author === filterAuthor;
      
      let matchesYear = true;
      if (yearFrom) {
        matchesYear = matchesYear && book.yearPublished >= parseInt(yearFrom);
      }
      if (yearTo) {
        matchesYear = matchesYear && book.yearPublished <= parseInt(yearTo);
      }

      return matchesSearch && matchesGenre && matchesAuthor && matchesYear;
    });

    // Sort books
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'year':
          return b.yearPublished - a.yearPublished;
        case 'year-asc':
          return a.yearPublished - b.yearPublished;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const handleLogBook = (book: Book) => {
    setSelectedBook(book);
    setLogDialogOpen(true);
  };

  const handleSaveLog = (logData: { startDate: string; finishDate: string; review: string; rating: number }) => {
    if (selectedBook) {
      const newLoggedBook: LoggedBook = {
        ...selectedBook,
        logId: crypto.randomUUID?.() || `temp-${Date.now()}`,
        ...logData,
        loggedDate: new Date().toISOString().split('T')[0]
      };
      onAddBook(newLoggedBook);
      setLogDialogOpen(false);
      setSelectedBook(null);
    }
  };

  const isBookLogged = (bookId: string) => {
    return loggedBooks.some(book => book.id === bookId);
  };

  const getLoggedBook = (bookId: string): LoggedBook | null => {
    return loggedBooks.find(book => book.id === bookId) || null;
  };

  const handleBookCardClick = (book: Book) => {
    // If book is logged, use the logged version to show review
    const loggedBook = getLoggedBook(book.id);
    setSelectedBookForDetail(loggedBook || book);
    setDetailModalOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterGenre('all');
    setFilterAuthor('all');
    setYearFrom('');
    setYearTo('');
  };

  const recommendations = mode === 'explore' ? getRecommendations() : null;
  const searchResults = mode === 'searching' ? getSearchResults() : [];

  const renderBookCard = (book: Book) => (
    <Card 
      key={book.id} 
      className="overflow-hidden hover:shadow-lg transition cursor-pointer"
      onClick={() => handleBookCardClick(book)}
    >
      <img
        src={book.coverUrl}
        alt={book.title}
        className="w-full h-64 object-cover"
      />
      <CardContent className="p-4">
        <h3 className="text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{book.author}</p>
        
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary">{book.genre}</Badge>
          <span className="text-xs text-gray-500">{book.yearPublished}</span>
        </div>

        <p className="text-sm text-gray-700 mb-4 line-clamp-3">{book.description}</p>
        
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleLogBook(book);
          }}
          disabled={isBookLogged(book.id)}
          className="w-full cursor-pointer"
          variant={isBookLogged(book.id) ? "secondary" : "default"}
        >
          {isBookLogged(book.id) ? 'Already Logged' : 'Log This Book'}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl text-gray-900 mb-2">
          {mode === 'explore' ? 'Explore Books' : 'Search Results'}
        </h2>
        <p className="text-gray-600">
          {mode === 'explore' 
            ? 'Discover personalized recommendations and trending titles'
            : 'Find your next great read with advanced filtering'
          }
        </p>
      </div>

      {loading && (
        <p className="text-gray-600 mb-4">Loading books...</p>
      )}

      {error && !loading && (
        <p className="text-red-500 mb-4">{error}</p>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by title, author, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Mobile Filter Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Refine your book search with filters
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Genre</label>
                  <Select value={filterGenre} onValueChange={setFilterGenre}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genres</SelectItem>
                      {genres.map(genre => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Author</label>
                  <Select value={filterAuthor} onValueChange={setFilterAuthor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Authors</SelectItem>
                      {authors.map(author => (
                        <SelectItem key={author} value={author}>{author}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Year From</label>
                  <Input
                    type="number"
                    placeholder="e.g. 1950"
                    value={yearFrom}
                    onChange={(e) => setYearFrom(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Year To</label>
                  <Input
                    type="number"
                    placeholder="e.g. 2024"
                    value={yearTo}
                    onChange={(e) => setYearTo(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">Title (A-Z)</SelectItem>
                      <SelectItem value="author">Author (A-Z)</SelectItem>
                      <SelectItem value="year">Year (Newest)</SelectItem>
                      <SelectItem value="year-asc">Year (Oldest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear All
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Filters - Only show when searching */}
      {mode === 'searching' && (
        <div className="hidden md:block bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 mr-2 text-gray-600" />
            <span className="text-gray-700">Advanced Filters</span>
            {(hasActiveFilters || searchQuery) && (
              <Button variant="ghost" onClick={clearFilters} className="ml-auto text-sm">
                Clear All
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select value={filterGenre} onValueChange={setFilterGenre}>
              <SelectTrigger>
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterAuthor} onValueChange={setFilterAuthor}>
              <SelectTrigger>
                <SelectValue placeholder="Author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                {authors.map(author => (
                  <SelectItem key={author} value={author}>{author}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Year From"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
            />

            <Input
              type="number"
              placeholder="Year To"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
            />

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title (A-Z)</SelectItem>
                <SelectItem value="author">Author (A-Z)</SelectItem>
                <SelectItem value="year">Year (Newest)</SelectItem>
                <SelectItem value="year-asc">Year (Oldest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/*Recommendations / All Books fallback */}
      {mode === 'explore' && recommendations && (
        <div className="space-y-8">
          {/* Recommended for You */}
          {recommendations.forYou.length > 0 ? (
            <div>
              <div className="flex items-center mb-4">
                <Sparkles className="w-6 h-6 text-indigo-600 mr-2" />
                <h3 className="text-2xl text-gray-900">Recommended for You</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recommendations.forYou.map(renderBookCard)}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-4">
                <TrendingUp className="w-6 h-6 text-indigo-600 mr-2" />
                <h3 className="text-2xl text-gray-900">Browse All Books</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map(renderBookCard)}
              </div>
            </div>
          )}
         
        </div>
      )}

      {/* Search */}
      {mode === 'searching' && (
        <>
          <div className="mb-4">
            <p className="text-gray-600">
              Showing {searchResults.length} {searchResults.length === 1 ? 'book' : 'books'}
            </p>
          </div>

          {searchResults.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl text-gray-900 mb-2">No books found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map(renderBookCard)}
            </div>
          )}
        </>
      )}

      {/* Log Book Dialog */}
      {selectedBook && (
        <LogBookDialog
          book={selectedBook}
          open={logDialogOpen}
          onOpenChange={setLogDialogOpen}
          onSave={handleSaveLog}
        />
      )}

      {/* Book Detail Modal */}
      {selectedBookForDetail && (
        <BookDetailModal
          book={selectedBookForDetail}
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          authToken={authToken}
          onLogBook={!('review' in selectedBookForDetail && 'rating' in selectedBookForDetail) ? (book, logData) => {
            const newLoggedBook: LoggedBook = {
              ...book,
              logId: crypto.randomUUID?.() || `temp-${Date.now()}`,
              ...logData,
              loggedDate: new Date().toISOString().split('T')[0]
            };
            onAddBook(newLoggedBook);
            setDetailModalOpen(false);
          } : undefined}
        />
      )}
    </div>
  );
}
