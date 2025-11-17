-- Créer la table des trajets
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  departure TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  available_seats INTEGER NOT NULL CHECK (available_seats > 0),
  price_per_seat NUMERIC(10, 2) NOT NULL CHECK (price_per_seat > 0),
  vehicle_model TEXT NOT NULL,
  vehicle_color TEXT,
  vehicle_plate TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des réservations
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seats_booked INTEGER NOT NULL CHECK (seats_booked > 0),
  total_price NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'paid', 'completed', 'cancelled')),
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur les tables
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policies pour trips
CREATE POLICY "Les trajets sont visibles par tous" 
ON public.trips 
FOR SELECT 
USING (true);

CREATE POLICY "Les utilisateurs peuvent créer leurs propres trajets" 
ON public.trips 
FOR INSERT 
WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Les conducteurs peuvent modifier leurs propres trajets" 
ON public.trips 
FOR UPDATE 
USING (auth.uid() = driver_id);

CREATE POLICY "Les conducteurs peuvent supprimer leurs propres trajets" 
ON public.trips 
FOR DELETE 
USING (auth.uid() = driver_id);

-- Policies pour bookings
CREATE POLICY "Les utilisateurs voient leurs propres réservations" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = passenger_id OR auth.uid() IN (
  SELECT driver_id FROM public.trips WHERE id = trip_id
));

CREATE POLICY "Les utilisateurs peuvent créer des réservations" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Les passagers peuvent mettre à jour leurs réservations" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = passenger_id);

CREATE POLICY "Les conducteurs peuvent mettre à jour les réservations de leurs trajets" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() IN (
  SELECT driver_id FROM public.trips WHERE id = trip_id
));

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_trips_updated_at
BEFORE UPDATE ON public.trips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();