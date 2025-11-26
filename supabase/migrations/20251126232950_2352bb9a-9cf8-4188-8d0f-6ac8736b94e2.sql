-- Create ratings table
CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL,
  rated_user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(booking_id, rater_id)
);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all ratings
CREATE POLICY "Ratings are viewable by everyone"
ON public.ratings
FOR SELECT
USING (true);

-- Policy: Users can create ratings for their completed bookings
CREATE POLICY "Users can rate after completed trips"
ON public.ratings
FOR INSERT
WITH CHECK (
  auth.uid() = rater_id AND
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.trips t ON b.trip_id = t.id
    WHERE b.id = booking_id
    AND (b.passenger_id = auth.uid() OR t.driver_id = auth.uid())
    AND t.departure_time < now()
  )
);

-- Create function to update user rating average
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET rating = (
    SELECT COALESCE(AVG(rating)::numeric(2,1), 5.0)
    FROM public.ratings
    WHERE rated_user_id = NEW.rated_user_id
  )
  WHERE user_id = NEW.rated_user_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-update rating
CREATE TRIGGER on_rating_created
  AFTER INSERT ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_rating();

-- Create indexes
CREATE INDEX idx_ratings_booking_id ON public.ratings(booking_id);
CREATE INDEX idx_ratings_rated_user_id ON public.ratings(rated_user_id);