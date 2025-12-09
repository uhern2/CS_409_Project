import { useState } from 'react';
import { Star, Edit, Trash2, User } from 'lucide-react';
import { Book, LoggedBook } from '../types/book';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { LogBookDialog } from './LogBookDialog';
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

interface BookDetailModalProps {
  book: Book | LoggedBook;
  currentUserId: string;
  currentUserName: string;
  reviews: Review[];
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
  onAddReview: (review: Review) => void;
  onUpdateReview: (reviewId: string, updates: { rating: number; text: string }) => void;
  onDeleteReview: (reviewId: string) => void;
}

export function BookDetailModal({ 
  book, 
  currentUserId,
  currentUserName,
  reviews,
  open, 
  onOpenChange, 
  onLogBook, 
  onUpdateBook,
  onAddReview,
  onUpdateReview,
  onDeleteReview
}: BookDetailModalProps) {
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
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  const userReview = reviews.find(r => r.userId === currentUserId);
  const otherReviews = reviews.filter(r => r.userId !== currentUserId);

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

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

  const handleSubmitReview = () => {
    if (reviewRating === 0 || reviewText.trim() === '') return;

    if (editingReviewId) {
      // UPDATE: PUT /reviews/:reviewId
      onUpdateReview(editingReviewId, { rating: reviewRating, text: reviewText });
      setEditingReviewId(null);
    } else {
      // CREATE: POST /books/:id/reviews
      const newReview: Review = {
        id: Date.now().toString(),
        bookId: baseBook.id,
        userId: currentUserId,
        userName: currentUserName,
        rating: reviewRating,
        text: reviewText,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddReview(newReview);
    }

    // Reset form
    setReviewText('');
    setReviewRating(0);
    setHoveredRating(0);
    setIsWritingReview(false);
  };

  const handleEditReview = (review: Review) => {
    setReviewText(review.text);
    setReviewRating(review.rating);
    setEditingReviewId(review.id);
    setIsWritingReview(true);
  };

  const handleCancelReview = () => {
    setReviewText('');
    setReviewRating(0);
    setHoveredRating(0);
    setEditingReviewId(null);
    setIsWritingReview(false);
  };

  const handleDeleteClick = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (reviewToDelete) {
      // DELETE: DELETE /reviews/:reviewId
      onDeleteReview(reviewToDelete);
    }
    setDeleteDialogOpen(false);
    setReviewToDelete(null);
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

          {/* Average Rating */}
          {averageRating && (
            <div className="flex flex-col items-center gap-2 py-4 border-t">
              <span className="text-sm font-medium text-gray-700">Community Rating</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.round(parseFloat(averageRating))
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xl font-semibold text-gray-700">
                  {averageRating}/5
                </span>
                <span className="text-sm text-gray-500">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
          )}

          {/* User Rating and Dates - If Logged */}
          {loggedBook && (
            <div className="space-y-4 pt-6 border-t">
              <div className="flex flex-col items-center gap-3 py-2">
                <span className="text-sm font-medium text-gray-700">Your Reading Log</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < loggedBook.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
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

          {/* User's Personal Review from Log */}
          {loggedBook && loggedBook.review && (
            <div className="space-y-4 pt-6 border-t">
              <h4 className="text-xl font-semibold text-gray-900 pb-2">Your Reading Notes</h4>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                  {loggedBook.review}
                </p>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="space-y-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-semibold text-gray-900">Community Reviews</h4>
              {!userReview && !isWritingReview && (
                <Button onClick={() => setIsWritingReview(true)} size="sm">
                  Write a Review
                </Button>
              )}
            </div>

            {/* Write/Edit Review Form */}
            {isWritingReview && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 space-y-4">
                  <h5 className="font-semibold text-gray-900">
                    {editingReviewId ? 'Edit Your Review' : 'Write Your Review'}
                  </h5>
                  
                  {/* Rating Stars */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Your Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= (hoveredRating || reviewRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {reviewRating === 0 && (
                      <p className="text-sm text-red-500">Please select a rating</p>
                    )}
                  </div>

                  {/* Review Text */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Your Review</label>
                    <Textarea
                      placeholder="Share your thoughts about this book..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={handleCancelReview}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmitReview}
                      disabled={reviewRating === 0 || reviewText.trim() === ''}
                    >
                      {editingReviewId ? 'Update Review' : 'Post Review'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User's Review */}
            {userReview && !isWritingReview && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{userReview.userName} (You)</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(userReview.createdAt)}
                          {userReview.updatedAt && ' (edited)'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditReview(userReview)}
                        className="hover:bg-blue-100"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(userReview.id)}
                        className="hover:bg-red-50 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < userReview.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{userReview.text}</p>
                </CardContent>
              </Card>
            )}

            {/* Other Reviews */}
            {otherReviews.length > 0 ? (
              <div className="space-y-4">
                {otherReviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{review.userName}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                            {review.updatedAt && ' (edited)'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{review.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              !userReview && !isWritingReview && (
                <p className="text-center text-gray-500 py-8">
                  No reviews yet. Be the first to review this book!
                </p>
              )
            )}
          </div>

          {/* Log/Edit Button */}
          {(onLogBook || onUpdateBook) && (
            <div className="pt-6 border-t flex justify-center">
              {loggedBook && onUpdateBook ? (
                <Button onClick={handleEditClick} className="px-12 py-4 text-base">
                  Edit Reading Log
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

    {/* Delete Review Confirmation */}
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Review</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete your review? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            className="bg-red-500 hover:bg-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}