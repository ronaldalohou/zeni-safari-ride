import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Clock, Star, Calendar } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

const Bookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            trips (
              departure,
              destination,
              departure_time,
              price_per_seat,
              vehicle_model,
              driver_id,
              profiles:driver_id (
                full_name,
                rating
              )
            )
          `)
          .eq('passenger_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } catch (error: any) {
        console.error('Erreur:', error);
        toast.error("Impossible de charger les réservations");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate]);

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
    const statusText = {
      pending: 'En attente',
      confirmed: 'Confirmé',
      completed: 'Terminé',
      cancelled: 'Annulé'
    }[booking.status] || booking.status;

    const statusColor = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-primary/10 text-primary',
      completed: 'bg-muted text-muted-foreground',
      cancelled: 'bg-red-100 text-red-800'
    }[booking.status] || 'bg-muted text-muted-foreground';

    return (
      <Card 
        className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => navigate(`/trip/${trip.id}`)}
      >
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
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {statusText}
          </div>
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
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
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

      <BottomNav />
    </div>
  );
};

export default Bookings;
