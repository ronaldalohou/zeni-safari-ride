import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  ratedUserId: string;
  ratedUserName: string;
  onRatingSubmitted: () => void;
}

export const RatingModal = ({
  isOpen,
  onClose,
  bookingId,
  ratedUserId,
  ratedUserName,
  onRatingSubmitted
}: RatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Veuillez sélectionner une note");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase
        .from('ratings')
        .insert({
          booking_id: bookingId,
          rater_id: user.id,
          rated_user_id: ratedUserId,
          rating,
          comment: comment.trim() || null
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("Vous avez déjà noté ce trajet");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Merci pour votre évaluation !");
      onRatingSubmitted();
      onClose();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de l'envoi de l'évaluation");
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Évaluer {ratedUserName}</DialogTitle>
          <DialogDescription>
            Comment s'est passé votre trajet ? Votre avis aide la communauté.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= displayRating
                        ? 'fill-accent text-accent'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {displayRating === 0 && "Sélectionnez une note"}
              {displayRating === 1 && "Très mauvais"}
              {displayRating === 2 && "Mauvais"}
              {displayRating === 3 && "Correct"}
              {displayRating === 4 && "Bien"}
              {displayRating === 5 && "Excellent"}
            </span>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Commentaire (optionnel)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
            >
              {submitting ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};