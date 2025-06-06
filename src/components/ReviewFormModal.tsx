import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast'; // Assuming you have shadcn/ui toast

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  // This function will be called after a successful review submission
  onReviewSubmitted: () => void;
  // Optional: Pass current user details if logged in
  currentUserId?: number;
  currentUserName?: string;
  currentUserEmail?: string;
}

const ReviewFormModal: React.FC<ReviewFormModalProps> = ({
  isOpen,
  onClose,
  productId,
  onReviewSubmitted,
  currentUserId,
  currentUserName,
  currentUserEmail,
}) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState(currentUserName || '');
  const [reviewerEmail, setReviewerEmail] = useState(currentUserEmail || '');
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (rating === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a star rating.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }
    if (!comment.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please write a comment for your review.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }
    if (!reviewerName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide your name.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          userId: currentUserId, // Will be null if not logged in
          reviewerName,
          reviewerEmail,
          rating,
          title,
          comment,
          // You might add verifiedPurchase logic here if applicable (e.g., check if user ordered this product)
          verifiedPurchase: 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      toast({
        title: 'Success!',
        description: 'Your review has been submitted.',
        // Assuming you have a 'success' variant for toast
      });
      onReviewSubmitted(); // Notify parent to refresh reviews/product data
      onClose(); // Close the modal
      // Reset form fields
      setRating(0);
      setTitle('');
      setComment('');
      // Keep name/email if they were from user data, otherwise clear
      if (!currentUserName) setReviewerName('');
      if (!currentUserEmail) setReviewerEmail('');
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'There was an issue submitting your review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience and help other shoppers.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rating" className="text-right">
              Rating
            </Label>
            <div className="flex col-span-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 cursor-pointer transition-colors ${
                    i < rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                  onClick={() => setRating(i + 1)}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Great product!"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="comment" className="text-right pt-2">
              Comment
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="col-span-3 resize-y"
              rows={4}
              placeholder="Tell us what you thought about the product..."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reviewerName" className="text-right">
              Your Name
            </Label>
            <Input
              id="reviewerName"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reviewerEmail" className="text-right">
              Your Email (Optional)
            </Label>
            <Input
              id="reviewerEmail"
              type="email"
              value={reviewerEmail}
              onChange={(e) => setReviewerEmail(e.target.value)}
              className="col-span-3"
              placeholder="email@example.com"
            />
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewFormModal;