import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Star, MapPin, Clock, Users, Car, Phone, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [seats, setSeats] = useState(1);
  const [trip, setTrip] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [existingBooking, setExistingBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetchTripDetails = async () => {
      if (!id) return;
      
      try {
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('*')
          .eq('id', id)
          .single();

        if (tripError) throw tripError;
        
        if (tripData) {
          setTrip(tripData);
          
          // Fetch driver profile
          const { data: driverData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', tripData.driver_id)
            .single();
          
          if (driverData) {
            setDriver(driverData);
          }

          // Check if user already has a booking on this trip
          if (user) {
            const { data: bookingData } = await supabase
              .from('bookings')
              .select('*')
              .eq('trip_id', id)
              .eq('passenger_id', user.id)
              .neq('status', 'cancelled')
              .maybeSingle();
            
            if (bookingData) {
              setExistingBooking(bookingData);
            }
          }
        }
      } catch (error: any) {
        console.error('Erreur:', error);
        toast.error("Impossible de charger les détails du trajet");
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [id, user]);

  const handleBook = async () => {
    if (!user) {
      toast.error("Vous devez être connecté");
      navigate("/auth");
      return;
    }

    if (!trip) return;

    setBooking(true);
    
    try {
      const totalPrice = trip.price_per_seat * seats;
      
      // Create booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          trip_id: trip.id,
          passenger_id: user.id,
          seats_booked: seats,
          total_price: totalPrice,
          status: 'pending',
          payment_status: 'pending'
        });

      if (bookingError) throw bookingError;

      // Update available seats
      const { error: updateError } = await supabase
        .from('trips')
        .update({ available_seats: trip.available_seats - seats })
        .eq('id', trip.id);

      if (updateError) throw updateError;

      toast.success("Demande de réservation envoyée !", {
        description: "Le conducteur doit maintenant accepter votre demande"
      });
      navigate("/bookings");
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la réservation: " + error.message);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Trajet introuvable</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6 safe-bottom">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 pt-4 safe-top sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="font-semibold text-lg">Détails du trajet</div>
            <div className="text-sm opacity-90">
              {trip.departure} → {trip.destination}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Driver Card */}
        {driver && (
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {driver.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-bold text-lg">{driver.full_name || 'Conducteur'}</div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    {driver.rating || 5.0}
                  </span>
                  <span>•</span>
                  <span className="text-muted-foreground">{driver.total_trips || 0} trajets</span>
                </div>
              </div>
            </div>
            
            {driver.phone && (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2" asChild>
                  <a href={`tel:${driver.phone}`}>
                    <Phone className="w-4 h-4" />
                    Appeler
                  </a>
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Trip Route */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Itinéraire
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <div className="w-0.5 h-16 bg-border"></div>
              </div>
              <div className="flex-1">
                <div className="font-semibold">{trip.departure}</div>
                <div className="text-sm font-medium mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {format(new Date(trip.departure_time), "dd MMM yyyy • HH:mm", { locale: fr })}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
              </div>
              <div className="flex-1">
                <div className="font-semibold">{trip.destination}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Vehicle Info */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            Véhicule
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Modèle</span>
              <span className="font-medium">{trip.vehicle_model}</span>
            </div>
            {trip.vehicle_color && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Couleur</span>
                <span className="font-medium">{trip.vehicle_color}</span>
              </div>
            )}
            {trip.vehicle_plate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Immatriculation</span>
                <span className="font-medium">{trip.vehicle_plate}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Description */}
        {trip.description && (
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">{trip.description}</p>
          </Card>
        )}

        {/* Booking Section */}
        <Card className="p-4">
          {existingBooking ? (
            // User already has a booking
            <div className="text-center">
              <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium mb-4 ${
                existingBooking.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : existingBooking.status === 'confirmed'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-red-100 text-red-800'
              }`}>
                {existingBooking.status === 'pending' && '⏳ En attente de validation'}
                {existingBooking.status === 'confirmed' && '✅ Réservation confirmée'}
                {existingBooking.status === 'cancelled' && '❌ Réservation refusée'}
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <div className="text-sm text-muted-foreground mb-1">Votre réservation</div>
                <div className="font-bold text-xl">{existingBooking.seats_booked} place(s)</div>
                <div className="text-primary font-bold">{existingBooking.total_price} CFA</div>
              </div>

              {existingBooking.status === 'pending' && (
                <p className="text-sm text-muted-foreground">
                  Le conducteur doit d'abord accepter votre demande de réservation.
                </p>
              )}

              {existingBooking.status === 'confirmed' && existingBooking.payment_status === 'pending' && (
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => toast.info("Paiement bientôt disponible", { description: "L'intégration PayDunya arrive bientôt" })}
                >
                  Procéder au paiement
                </Button>
              )}

              <Button 
                variant="outline" 
                className="w-full mt-3"
                onClick={() => navigate('/bookings')}
              >
                Voir mes réservations
              </Button>
            </div>
          ) : user?.id === trip.driver_id ? (
            // User is the driver
            <div className="text-center">
              <p className="text-muted-foreground mb-4">C'est votre trajet</p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/driver')}
              >
                Voir le tableau de bord
              </Button>
            </div>
          ) : (
            // Normal booking flow
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">Prix par place</div>
                  <div className="text-3xl font-bold text-primary">{trip.price_per_seat} CFA</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Places disponibles</div>
                  <div className="text-2xl font-bold">{trip.available_seats}</div>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Nombre de places</label>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setSeats(Math.max(1, seats - 1))}
                    disabled={seats <= 1}
                  >
                    -
                  </Button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-bold">{seats}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setSeats(Math.min(trip.available_seats, seats + 1))}
                    disabled={seats >= trip.available_seats}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="border-t pt-3 mb-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{trip.price_per_seat * seats} CFA</span>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 mb-4 text-sm text-center">
                <span className="text-muted-foreground">
                  ℹ️ Le conducteur devra accepter votre demande avant le paiement
                </span>
              </div>

              <Button onClick={handleBook} size="lg" className="w-full" disabled={booking || trip.available_seats === 0}>
                {booking ? "Réservation..." : trip.available_seats === 0 ? "Complet" : `Demander ${seats} place${seats > 1 ? 's' : ''}`}
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TripDetails;
