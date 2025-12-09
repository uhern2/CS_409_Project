import { useState, useEffect } from "react";
import { Calendar, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Book } from "../types/book";

interface LogBookDialogProps {
  book: Book;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    startDate: string;
    finishDate: string;
    review: string;
    rating: number;
  }) => void;
  initialLog?: {
    startDate: string;
    finishDate: string;
    review: string;
    rating: number;
  };
}

export function LogBookDialog({
  book,
  open,
  onOpenChange,
  onSave,
  initialLog,
}: LogBookDialogProps) {
  const [startDate, setStartDate] = useState("");
  const [finishDate, setFinishDate] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Load initial data when dialog opens or initialLog changes
  useEffect(() => {
    if (open) {
      if (initialLog) {
        setStartDate(initialLog.startDate);
        setFinishDate(initialLog.finishDate);
        setReview(initialLog.review);
        setRating(initialLog.rating);
      } else {
        setStartDate("");
        setFinishDate("");
        setReview("");
        setRating(0);
      }
      setHoveredRating(0);
    }
  }, [initialLog, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    
    onSave({ startDate, finishDate, review, rating });
    
    // Reset form only if creating new log (not editing)
    if (!initialLog) {
      setStartDate("");
      setFinishDate("");
      setReview("");
      setRating(0);
    }
    
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form only if creating new log (not editing)
    if (!initialLog) {
      setStartDate("");
      setFinishDate("");
      setReview("");
      setRating(0);
      setHoveredRating(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialLog ? "Edit Book Log" : "Log Book"}
          </DialogTitle>
          <DialogDescription>
            {initialLog 
              ? `Update your log for ${book.title}`
              : `Add reading dates and your review for ${book.title}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Book Info */}
          <div className="flex gap-4">
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-24 h-36 object-cover rounded"
            />
            <div>
              <h3 className="text-gray-900 mb-1">
                {book.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {book.author}
              </p>
              <p className="text-sm text-gray-500">
                {book.genre} • {book.yearPublished}
              </p>
            </div>
          </div>

          {/* Reading Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="finish-date">
                <Calendar className="w-4 h-4 inline mr-1" />
                Finish Date
              </Label>
              <Input
                id="finish-date"
                type="date"
                value={finishDate}
                onChange={(e) => setFinishDate(e.target.value)}
                min={startDate}
                required
              />
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>
              <Star className="w-4 h-4 inline mr-1" />
              Rating
            </Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating === 0 && (
              <p className="text-sm text-red-500">
                Please select a rating
              </p>
            )}
          </div>

          {/* Review */}
          <div className="space-y-2">
            <Label htmlFor="review">Review</Label>
            <Textarea
              id="review"
              placeholder="Share your thoughts about this book..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={6}
              required
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={handleSubmit} 
            disabled={rating === 0}
          >
            {initialLog ? "Update Book Log" : "Save Book Log"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}