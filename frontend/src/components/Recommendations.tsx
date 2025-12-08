import { useState, useMemo } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { mockBooks } from '../data/mockBooks';
import { Book, LoggedBook } from '../types/book';
import { LogBookDialog } from './LogBookDialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';

interface RecommendationsProps {
  loggedBooks: LoggedBook[];
  onAddBook: (book: LoggedBook) => void;
}

export function Recommendations({ loggedBooks, onAddBook }: RecommendationsProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [logDialogOpen, setLogDialogOpen] = useState(false);

  // Calculate recommendations based on user's reading history
  const recommendations = useMemo(() => {
    if (loggedBooks.length === 0) {
      // If no books logged, return popular/varied books
      return {
        genreBased: mockBooks.slice(0, 6),
        authorBased: [],
        trending: mockBooks.slice(6, 12)
      };
    }

    // Get user's favorite genres (based on highest ratings)
    const genreScores: Record<string, { total: number; count: number }> = {};
    loggedBooks.forEach(book => {
      if (!genreScores[book.genre]) {
        genreScores[book.genre] = { total: 0, count: 0 };
      }
      genreScores[book.genre].total += book.rating;
      genreScores[book.genre].count += 1;
    });

    const favoriteGenres = Object.entries(genreScores)
      .map(([genre, scores]) => ({
        genre,
        avgRating: scores.total / scores.count
      }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .map(item => item.genre);

    // Get user's favorite authors
    const authorScores: Record<string, { total: number; count: number }> = {};
    loggedBooks.forEach(book => {
      if (!authorScores[book.author]) {
        authorScores[book.author] = { total: 0, count: 0 };
      }
      authorScores[book.author].total += book.rating;
      authorScores[book.author].count += 1;
    });

    const favoriteAuthors = Object.entries(authorScores)
      .map(([author, scores]) => ({
        author,
        avgRating: scores.total / scores.count
      }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .map(item => item.author);

    // Filter out already logged books
    const loggedBookIds = new Set(loggedBooks.map(b => b.id));
    const availableBooks = mockBooks.filter(book => !loggedBookIds.has(book.id));

    // Genre-based recommendations
    const genreBased = availableBooks
      .filter(book => favoriteGenres.includes(book.genre))
      .slice(0, 6);

    // Author-based recommendations
    const authorBased = availableBooks
      .filter(book => favoriteAuthors.includes(book.author))
      .slice(0, 6);

    // Trending/Popular (newer books)
    const trending = availableBooks
      .sort((a, b) => b.yearPublished - a.yearPublished)
      .slice(0, 6);

    return { genreBased, authorBased, trending };
  }, [loggedBooks]);

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

  const renderBookGrid = (books: Book[]) => {
    if (books.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          No recommendations available in this category yet.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map(book => (
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
    );
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Sparkles className="w-8 h-8 text-indigo-600 mr-2" />
          <h2 className="text-3xl text-gray-900">Recommendations</h2>
        </div>
        <p className="text-gray-600">
          {loggedBooks.length === 0
            ? 'Log some books to get personalized recommendations!'
            : 'Discover books based on your reading history'}
        </p>
      </div>

      <Tabs defaultValue="genre" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="genre">Based on Genre</TabsTrigger>
          <TabsTrigger value="author">Same Authors</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="genre">
          <div className="mb-4">
            <h3 className="text-gray-900 mb-1">Books in Your Favorite Genres</h3>
            <p className="text-sm text-gray-600">
              Based on the genres you've rated highly
            </p>
          </div>
          {renderBookGrid(recommendations.genreBased)}
        </TabsContent>

        <TabsContent value="author">
          <div className="mb-4">
            <h3 className="text-gray-900 mb-1">More from Your Favorite Authors</h3>
            <p className="text-sm text-gray-600">
              Discover other works by authors you love
            </p>
          </div>
          {renderBookGrid(recommendations.authorBased)}
        </TabsContent>

        <TabsContent value="trending">
          <div className="mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
            <div>
              <h3 className="text-gray-900 mb-1">Trending & Recent Releases</h3>
              <p className="text-sm text-gray-600">
                Popular books and recent publications
              </p>
            </div>
          </div>
          {renderBookGrid(recommendations.trending)}
        </TabsContent>
      </Tabs>

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
