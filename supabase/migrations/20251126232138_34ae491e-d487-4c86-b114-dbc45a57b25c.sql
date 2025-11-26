-- Create messages table linked to bookings
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages for their bookings (as passenger or driver)
CREATE POLICY "Users can view messages of their bookings"
ON public.messages
FOR SELECT
USING (
  sender_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.trips t ON b.trip_id = t.id
    WHERE b.id = messages.booking_id
    AND (b.passenger_id = auth.uid() OR t.driver_id = auth.uid())
  )
);

-- Policy: Users can send messages for their bookings
CREATE POLICY "Users can send messages for their bookings"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.trips t ON b.trip_id = t.id
    WHERE b.id = booking_id
    AND (b.passenger_id = auth.uid() OR t.driver_id = auth.uid())
  )
);

-- Policy: Users can mark messages as read
CREATE POLICY "Users can update read status"
ON public.messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.trips t ON b.trip_id = t.id
    WHERE b.id = messages.booking_id
    AND (b.passenger_id = auth.uid() OR t.driver_id = auth.uid())
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create index for faster queries
CREATE INDEX idx_messages_booking_id ON public.messages(booking_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);