import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  rater_name: string;
  rater_photo: string | null;
}

interface ProfileReviewsProps {
  userId: string;
}

export function ProfileReviews({ userId }: ProfileReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('ratings')
      .select('id, rating, comment, created_at, rater_id')
      .eq('rated_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
      return;
    }

    // Fetch rater profiles
    if (data && data.length > 0) {
      const raterIds = data.map(r => r.rater_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, photo_url')
        .in('user_id', raterIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      const reviewsWithProfiles: Review[] = data.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        rater_name: profileMap.get(r.rater_id)?.full_name || 'Utilisateur',
        rater_photo: profileMap.get(r.rater_id)?.photo_url || null,
      }));
      
      setReviews(reviewsWithProfiles);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-semibold">Avis reçus</h2>
        </div>
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h2 className="text-lg font-semibold">Avis reçus ({reviews.length})</h2>
      </div>
      
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun avis pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.rater_photo || undefined} />
                  <AvatarFallback>
                    {review.rater_name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm truncate">{review.rater_name}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  <div className="mt-1">
                    {renderStars(review.rating)}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
