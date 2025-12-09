import { useState } from 'react';
import { Search, Calendar, Star, Trash2, Filter, Edit } from 'lucide-react';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LoggedBook } from '../types/book';
import { LogBookDialog } from './LogBookDialog';
import { BookDetailModal } from './BookDetailModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface MyBooksProps {
  loggedBooks: LoggedBook[];
  onDeleteBook: (bookId: string) => void;
  onUpdateBook: (bookId: string, updates: {
    startDate: string;
    finishDate: string;
    review: string;
    rating: number;
  }) => void;
}

export function MyBooks({ loggedBooks, onDeleteBook, onUpdateBook }: MyBooksProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<LoggedBook | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<LoggedBook | null>(null);

  // Get unique genres from logged books
  const genres = Array.from(new Set(loggedBooks.map(book => book.genre)));

  // Filter and sort books
  let filteredBooks = loggedBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = filterGenre === 'all' || book.genre === filterGenre;
    return matchesSearch && matchesGenre;
  });

  // Sort books
  filteredBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'rating':
        return b.rating - a.rating;
      case 'recent':
      default:
        return new Date(b.loggedDate).getTime() - new Date(a.loggedDate).getTime();
    }
  });

  const handleDeleteClick = (bookId: string) => {
    setBookToDelete(bookId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (bookToDelete) {
      onDeleteBook(bookToDelete);
    }
    setDeleteDialogOpen(false);
    setBookToDelete(null);
  };

  const handleEditClick = (book: LoggedBook) => {
    setBookToEdit(book);
    setEditDialogOpen(true);
  };

  const handleUpdateLog = (updates: {
    startDate: string;
    finishDate: string;
    review: string;
    rating: number;
  }) => {
    if (!bookToEdit) return;
    onUpdateBook(bookToEdit.id, updates);
    setEditDialogOpen(false);
    setBookToEdit(null);
  };

  const handleBookCardClick = (book: LoggedBook) => {
    setSelectedBookForDetail(book);
    setDetailModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl text-gray-900 mb-2">My Books</h2>
        <p className="text-gray-600">Track and review the books you've read</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterGenre} onValueChange={setFilterGenre}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by genre" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map(genre => (
                <SelectItem key={genre} value={genre}>{genre}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="title">Title (A-Z)</SelectItem>
              <SelectItem value="author">Author (A-Z)</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery || filterGenre !== 'all'
              ? 'No books found matching your filters'
              : 'No books logged yet. Start searching to add your first book!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map(book => (
            <Card 
              key={book.id} 
              className="overflow-hidden hover:shadow-lg transition cursor-pointer"
              onClick={() => handleBookCardClick(book)}
            >
              <div className="flex">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-32 h-48 object-cover"
                />
                <CardContent className="flex-1 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                    </div>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(book)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(book.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Badge variant="secondary" className="mb-3">{book.genre}</Badge>

                  <div className="flex items-center mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm">{book.rating}/5</span>
                  </div>

                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{formatDate(book.startDate)} - {formatDate(book.finishDate)}</span>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-3">{book.review}</p>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this book from your logged books? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Log Dialog */}
      {bookToEdit && (
        <LogBookDialog
          book={bookToEdit}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          initialLog={{
            startDate: bookToEdit.startDate,
            finishDate: bookToEdit.finishDate,
            review: bookToEdit.review,
            rating: bookToEdit.rating,
          }}
          onSave={handleUpdateLog}
        />
      )}

      {/* Book Detail Modal */}
      {selectedBookForDetail && (
        <BookDetailModal
          book={selectedBookForDetail}
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          onUpdateBook={(bookId, updates) => {
            onUpdateBook(bookId, updates);
            setDetailModalOpen(false);
          }}
        />
      )}
    </div>
  );
}