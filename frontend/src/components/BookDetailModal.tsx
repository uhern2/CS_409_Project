import { useState } from 'react';
import { Book, LoggedBook } from '../types/book';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { LogBookDialog } from './LogBookDialog';

interface BookDetailModalProps {
  book: Book | LoggedBook;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogBook?: (book: Book, logData: {
    startDate: string;
    finishDate: string;
    review: string;
    rating: number;
  }) => void;
  onUpdateBook?: (bookId: string, updates: {
    startDate: string;
    finishDate: string;
    review: string;
    rating: number;
  }) => void;
}

export function BookDetailModal({ book, open, onOpenChange, onLogBook, onUpdateBook }: BookDetailModalProps) {
  const isLoggedBook = 'review' in book && 'rating' in book;
  const loggedBook = isLoggedBook ? book as LoggedBook : null;
  const baseBook: Book = {
    id: book.id,
    title: book.title,
    author: book.author,
    genre: book.genre,
    yearPublished: book.yearPublished,
    coverUrl: book.coverUrl,
    description: book.description,
    pages: book.pages,
  };

  const [logDialogOpen, setLogDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleLogClick = () => {
    setLogDialogOpen(true);
  };

  const handleEditClick = () => {
    setLogDialogOpen(true);
  };

  const handleSaveLog = (logData: {
    startDate: string;
    finishDate: string;
    review: string;
    rating: number;
  }) => {
    if (loggedBook && onUpdateBook) {
      onUpdateBook(loggedBook.id, logData);
    } else if (onLogBook) {
      onLogBook(baseBook, logData);
    }
    setLogDialogOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center sm:text-center pb-4">
            <DialogTitle className="text-3xl font-bold">{book.title}</DialogTitle>
          </DialogHeader>
        
        <div className="space-y-10">
          {/* Book Cover - Centered */}
          <div className="flex justify-center py-4">
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-64 h-96 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Title and Author */}
          <div className="text-center space-y-3 py-2">
            <h3 className="text-2xl font-semibold text-gray-900">{book.title}</h3>
            <p className="text-xl text-gray-700">by {book.author}</p>
          </div>

          {/* Badges - Centered */}
          <div className="flex flex-wrap justify-center gap-3 py-2">
            <Badge variant="secondary" className="text-sm px-4 py-2">{book.genre}</Badge>
            <Badge variant="outline" className="text-sm px-4 py-2">{book.yearPublished}</Badge>
            <Badge variant="outline" className="text-sm px-4 py-2">{book.pages} pages</Badge>
          </div>

          {/* User Rating and Dates - If Logged */}
          {loggedBook && (
            <div className="space-y-4 pt-6 border-t">
              <div className="flex flex-col items-center gap-3 py-2">
                <span className="text-sm font-medium text-gray-700">Your Rating</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-2xl ${
                        i < loggedBook.rating
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-3 text-lg font-semibold text-gray-700">
                    {loggedBook.rating}/5
                  </span>
                </div>
              </div>
              <div className="text-center text-sm text-gray-600 py-2">
                <span className="font-medium">Read from:</span>{' '}
                {formatDate(loggedBook.startDate)} - {formatDate(loggedBook.finishDate)}
              </div>
            </div>
          )}

          {/* Full Description */}
          <div className="space-y-4 pt-6 border-t">
            <h4 className="text-xl font-semibold text-gray-900 pb-2">Description</h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
              {book.description}
            </p>
          </div>

          {/* User Review Section */}
          {loggedBook && loggedBook.review && (
            <div className="space-y-4 pt-6 border-t">
              <h4 className="text-xl font-semibold text-gray-900 pb-2">Your Review</h4>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                  {loggedBook.review}
                </p>
              </div>
            </div>
          )}

          {/* Log/Edit Button */}
          {(onLogBook || onUpdateBook) && (
            <div className="pt-6 border-t flex justify-center">
              {loggedBook && onUpdateBook ? (
                <Button onClick={handleEditClick} className="px-12 py-4 text-base">
                  Edit Log
                </Button>
              ) : onLogBook ? (
                <Button onClick={handleLogClick} className="px-12 py-4 text-base">
                  Log This Book
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* Log Book Dialog */}
    {logDialogOpen && (
      <LogBookDialog
        book={baseBook}
        open={logDialogOpen}
        onOpenChange={setLogDialogOpen}
        onSave={handleSaveLog}
        initialLog={loggedBook ? {
          startDate: loggedBook.startDate,
          finishDate: loggedBook.finishDate,
          review: loggedBook.review,
          rating: loggedBook.rating,
        } : undefined}
      />
    )}
    </>
  );
}

