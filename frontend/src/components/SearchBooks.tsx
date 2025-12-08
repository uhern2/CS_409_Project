import { useState } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { mockBooks } from '../data/mockBooks';
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

interface SearchBooksProps {
  onAddBook: (book: LoggedBook) => void;
  loggedBooks: LoggedBook[];
}

export function SearchBooks({ onAddBook, loggedBooks }: SearchBooksProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [logDialogOpen, setLogDialogOpen] = useState(false);

  // Get unique genres and authors
  const genres = Array.from(new Set(mockBooks.map(book => book.genre)));
  const authors = Array.from(new Set(mockBooks.map(book => book.author))).sort();

  // Filter books
  let filteredBooks = mockBooks.filter(book => {
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
  filteredBooks = [...filteredBooks].sort((a, b) => {
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

  const handleLogBook = (book: Book) => {
    setSelectedBook(book);
    setLogDialogOpen(true);
  };

  const handleSaveLog = (logData: { startDate: string; finishDate: string; review: string; rating: number }) => {
    if (selectedBook) {
      const newLoggedBook: LoggedBook = {
        ...selectedBook,
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

  const clearFilters = () => {
    setFilterGenre('all');
    setFilterAuthor('all');
    setYearFrom('');
    setYearTo('');
  };

  const hasActiveFilters = filterGenre !== 'all' || filterAuthor !== 'all' || yearFrom || yearTo;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl text-gray-900 mb-2">Search Books</h2>
        <p className="text-gray-600">Discover your next great read with advanced filtering</p>
      </div>

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
                    Clear Filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 mr-2 text-gray-600" />
          <span className="text-gray-700">Advanced Filters</span>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="ml-auto text-sm">
              Clear Filters
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

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
        </p>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map(book => (
          <Card key={book.id} className="overflow-hidden hover:shadow-lg transition">
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
                onClick={() => handleLogBook(book)}
                disabled={isBookLogged(book.id)}
                className="w-full"
                variant={isBookLogged(book.id) ? "secondary" : "default"}
              >
                {isBookLogged(book.id) ? 'Already Logged' : 'Log This Book'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Log Book Dialog */}
      {selectedBook && (
        <LogBookDialog
          book={selectedBook}
          open={logDialogOpen}
          onOpenChange={setLogDialogOpen}
          onSave={handleSaveLog}
        />
      )}
    </div>
  );
}
