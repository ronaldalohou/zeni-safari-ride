import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Clock, Star, Calendar, MessageCircle } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { RatingModal } from "@/components/RatingModal";

const Bookings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [userRatings, setUserRatings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    bookingId: string;
    ratedUserId: string;
    ratedUserName: string;
  } | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const { data: bookingsData, error } = await supabase
          .from('bookings')
          .select(`
            *,
            trips (
              id,
              departure,
              destination,
              departure_time,
              price_per_seat,
              vehicle_model,
              driver_id
            )
          `)
          .eq('passenger_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Fetch driver profiles separately
        const driverIds = [...new Set(bookingsData?.map(b => b.trips?.driver_id).filter(Boolean) || [])];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, rating')
          .in('user_id', driverIds);
        
        // Fetch user's existing ratings
        const bookingIds = bookingsData?.map(b => b.id) || [];
        if (bookingIds.length > 0) {
          const { data: ratingsData } = await supabase
            .from('ratings')
            .select('booking_id')
            .eq('rater_id', user.id)
            .in('booking_id', bookingIds);
          
          setUserRatings(ratingsData?.map(r => r.booking_id) || []);
        }
        
        // Merge profiles with bookings
        const bookingsWithProfiles = bookingsData?.map(booking => ({
          ...booking,
          trips: booking.trips ? {
            ...booking.trips,
            profiles: profilesData?.find(p => p.user_id === booking.trips?.driver_id) || null
          } : null
        })) || [];
        
        setBookings(bookingsWithProfiles);
      } catch (error: any) {
        console.error('Erreur:', error);
        toast.error("Impossible de charger les réservations");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, authLoading, navigate]);

  const refreshBookings = () => {
    setLoading(true);
    // Re-trigger the effect by updating a dependency
    if (user) {
      supabase
        .from('ratings')
        .select('booking_id')
        .eq('rater_id', user.id)
        .then(({ data }) => {
          setUserRatings(data?.map(r => r.booking_id) || []);
        });
    }
  };

  const upcomingBookings = bookings.filter(b => 
    b.status !== 'completed' && b.status !== 'cancelled' && 
    new Date(b.trips?.departure_time) > new Date()
  );
  
  const pastBookings = bookings.filter(b => 
    b.status === 'completed' || 
    new Date(b.trips?.departure_time) <= new Date()
  );

  const BookingCard = ({ booking }: any) => {
    if (!booking.trips) return null;
    
    const trip = booking.trips;
    const isPastTrip = new Date(trip.departure_time) <= new Date();
    const statusConfig: Record<string, { text: string; color: string; description: string }> = {
      pending: { 
        text: 'En attente', 
        color: 'bg-yellow-100 text-yellow-800',
        description: '⏳ En attente de validation du conducteur'
      },
      confirmed: { 
        text: 'Confirmé', 
        color: 'bg-primary/10 text-primary',
        description: '✅ Le conducteur a accepté votre réservation'
      },
      completed: { 
        text: 'Terminé', 
        color: 'bg-muted text-muted-foreground',
        description: 'Trajet terminé'
      },
      cancelled: { 
        text: 'Refusé', 
        color: 'bg-red-100 text-red-800',
        description: '❌ Réservation refusée par le conducteur'
      }
    };

    const status = statusConfig[booking.status] || statusConfig.pending;

    return (
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{trip.departure}</span>
              <span className="text-muted-foreground">→</span>
              <span className="font-semibold">{trip.destination}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(trip.departure_time), "dd MMM yyyy", { locale: fr })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {format(new Date(trip.departure_time), "HH:mm", { locale: fr })}
              </span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
            {status.text}
          </div>
        </div>

        {/* Status message */}
        <div className="bg-muted/50 rounded-lg p-2 mb-3 text-sm">
          {status.description}
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {trip.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'C'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium">{trip.profiles?.full_name || 'Conducteur'}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-accent text-accent" />
                {trip.profiles?.rating || 5.0}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-primary">{booking.total_price} CFA</div>
            <div className="text-xs text-muted-foreground">{booking.seats_booked} place(s)</div>
          </div>
        </div>

        {/* Action buttons based on status */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {booking.status === 'confirmed' && booking.payment_status === 'pending' && new Date(trip.departure_time) > new Date() && (
            <Button 
              className="flex-1"
              onClick={() => toast.info("Paiement bientôt disponible", { description: "L'intégration PayDunya arrive bientôt" })}
            >
              Procéder au paiement
            </Button>
          )}

          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate(`/messages?booking=${booking.id}`)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>

          {booking.status === 'pending' && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => navigate(`/trip/${trip.id}`)}
            >
              Voir trajet
            </Button>
          )}

          {/* Rating button for past trips */}
          {isPastTrip && !userRatings.includes(booking.id) && booking.status !== 'cancelled' && (
            <Button 
              variant="secondary"
              size="sm"
              onClick={() => setRatingModal({
                isOpen: true,
                bookingId: booking.id,
                ratedUserId: trip.driver_id,
                ratedUserName: trip.profiles?.full_name || 'Conducteur'
              })}
            >
              <Star className="w-4 h-4 mr-2" />
              Évaluer
            </Button>
          )}

          {isPastTrip && userRatings.includes(booking.id) && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Star className="w-3 h-3 fill-accent text-accent" />
              Évalué
            </span>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24 safe-bottom">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 pt-4 safe-top sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/")}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="font-semibold text-lg">Mes réservations</div>
            <div className="text-sm opacity-90">Gérez vos trajets</div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upcoming">À venir</TabsTrigger>
            <TabsTrigger value="past">Terminés</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : upcomingBookings.length > 0 ? (
              upcomingBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
            ) : (
              <Card className="p-8 text-center">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Aucune réservation à venir</p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate("/")}
                >
                  Voir les trajets
                </Button>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : pastBookings.length > 0 ? (
              pastBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Aucune réservation passée</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Rating Modal */}
      {ratingModal && (
        <RatingModal
          isOpen={ratingModal.isOpen}
          onClose={() => setRatingModal(null)}
          bookingId={ratingModal.bookingId}
          ratedUserId={ratingModal.ratedUserId}
          ratedUserName={ratingModal.ratedUserName}
          onRatingSubmitted={refreshBookings}
        />
      )}

      <BottomNav />
    </div>
  );
};

export default Bookings;
