import { useEffect, useState } from 'react';
import { Book, LoggedBook } from '../types/book';
import { Star } from 'lucide-react';
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
  authToken?: string;
  onLogBook?: (book: Book, logData: {
    startDate: string;
    finishDate: string;
    review: string;
    rating: number;
  }) => void;
  onUpdateBook?: (logId: string, updates: {
    startDate: string;
    finishDate: string;
    review: string;
    rating: number;
  }) => void;
}

export function BookDetailModal({ book, open, onOpenChange, authToken, onLogBook, onUpdateBook }: BookDetailModalProps) {
  const isLoggedBook = 'review' in book && 'rating' in book;
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

  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailStats, setDetailStats] = useState<{
    averageRating: number | null;
    reviewCount: number;
    userLog: LoggedBook | null;
    reviews: {
      id: string;
      reviewer: string;
      rating: number;
      review: string;
      loggedDate: string;
    }[];
  } | null>(null);

  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [reviewSort, setReviewSort] = useState<"recent" | "rating-desc" | "rating-asc">("recent");
  const [reviewsVisible, setReviewsVisible] = useState(5);

  // Fetch book detail with stats + user log (if authenticated)
  useEffect(() => {
    async function fetchDetail() {
      if (!open) return;
      setDetailLoading(true);
      setDetailError(null);
      try {
        const res = await fetch(`http://localhost:4000/books/${baseBook.id}`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        });
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data = await res.json();
        setDetailStats({
          averageRating: data.averageRating ?? null,
          reviewCount: data.reviewCount ?? 0,
          userLog: data.userLog ?? null,
          reviews: data.reviews ?? [],
        });
      } catch (err) {
        console.error('Error loading book detail:', err);
        setDetailError('Failed to load book details.');
      } finally {
        setDetailLoading(false);
      }
    }

    fetchDetail();
  }, [authToken, baseBook.id, open]);

  const loggedBook = (detailStats?.userLog ?? (isLoggedBook ? (book as LoggedBook) : null));
  const averageRating = detailStats?.averageRating ?? null;
  const reviewCount = detailStats?.reviewCount ?? 0;
  const communityReviews = detailStats?.reviews ?? [];
  const sortedReviews = [...communityReviews].sort((a, b) => {
    if (reviewSort === "rating-desc") return (b.rating ?? 0) - (a.rating ?? 0);
    if (reviewSort === "rating-asc") return (a.rating ?? 0) - (b.rating ?? 0);
    // recent by date
    return new Date(b.loggedDate).getTime() - new Date(a.loggedDate).getTime();
  });
  const visibleReviews = sortedReviews.slice(0, reviewsVisible);

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
      onUpdateBook(loggedBook.logId, logData);
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
              {detailLoading && (
                <p className="text-sm text-gray-500">Loading book details...</p>
              )}
              {detailError && (
                <p className="text-sm text-red-500">{detailError}</p>
              )}
            </div>

            {/* Badges - Centered */}
            <div className="flex flex-wrap justify-center gap-3 py-2">
              <Badge variant="secondary" className="text-sm px-4 py-2">{book.genre}</Badge>
              <Badge variant="outline" className="text-sm px-4 py-2">{book.yearPublished}</Badge>
              <Badge variant="outline" className="text-sm px-4 py-2">{book.pages} pages</Badge>
            </div>

            {/* Aggregate rating */}
            <div className="flex justify-center gap-4 items-center">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-gray-800 font-medium">
                {averageRating !== null ? averageRating.toFixed(1) : 'No rating yet'}
              </span>
              <span className="text-sm text-gray-500">
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </span>
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

          {/* Community Reviews */}
          {communityReviews.length > 0 && (
            <div className="space-y-4 pt-6 border-t">
              <h4 className="text-xl font-semibold text-gray-900 pb-2">Community Reviews</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Showing {Math.min(reviewsVisible, communityReviews.length)} of {communityReviews.length}
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Sort by:</label>
                  <select
                    value={reviewSort}
                    onChange={(e) => {
                      setReviewSort(e.target.value as "recent" | "rating-desc" | "rating-asc");
                      setReviewsVisible(5);
                    }}
                    className="border border-gray-200 rounded px-2 py-1 text-sm text-gray-700 bg-white"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="rating-desc">Highest Rated</option>
                    <option value="rating-asc">Lowest Rated</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                {visibleReviews.map((rev) => (
                  <div key={rev.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{rev.reviewer}</div>
                      <div className="text-sm text-gray-500">{formatDate(rev.loggedDate)}</div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-800">{rev.rating}/5</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                      {rev.review}
                    </p>
                  </div>
                ))}
              </div>
              {reviewsVisible < sortedReviews.length && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setReviewsVisible((prev) => Math.min(prev + 5, sortedReviews.length))}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-2"
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Log/Edit Button */}
          {(onLogBook || onUpdateBook) && (
            <div className="pt-6 border-t flex justify-center">
              {loggedBook && onUpdateBook ? (
                <Button onClick={handleEditClick} className="px-12 py-4 text-base mx-2">
                  Edit Log
                </Button>
              ) : onLogBook ? (
                <Button onClick={handleLogClick} className="px-12 py-4 text-base mx-2">
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
