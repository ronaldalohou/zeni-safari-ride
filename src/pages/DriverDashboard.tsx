import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Clock, Users, Check, X, DollarSign } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [bookingRequests, setBookingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch driver's trips
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .eq('driver_id', user.id)
        .order('departure_time', { ascending: true });

      if (tripsError) throw tripsError;

      // Fetch booking requests for driver's trips
      const tripIds = tripsData?.map(t => t.id) || [];
      
      if (tripIds.length > 0) {
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            trips (departure, destination, departure_time)
          `)
          .in('trip_id', tripIds)
          .order('created_at', { ascending: false });

        if (bookingsError) throw bookingsError;
        
        // Fetch passenger profiles separately
        const passengerIds = [...new Set(bookingsData?.map(b => b.passenger_id) || [])];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, rating, phone')
          .in('user_id', passengerIds);
        
        // Merge profiles with bookings
        const bookingsWithProfiles = bookingsData?.map(booking => ({
          ...booking,
          profiles: profilesData?.find(p => p.user_id === booking.passenger_id) || null
        })) || [];
        
        setBookingRequests(bookingsWithProfiles);
      }

      setMyTrips(tripsData || []);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error("Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'confirmed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: action })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success(action === 'confirmed' ? 'Réservation acceptée' : 'Réservation refusée');
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const activeTrips = myTrips.filter(t => t.status === 'active' && new Date(t.departure_time) > new Date());
  const pastTrips = myTrips.filter(t => t.status === 'completed' || new Date(t.departure_time) <= new Date());
  const pendingRequests = bookingRequests.filter(b => b.status === 'pending');

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
          <div className="flex-1">
            <div className="font-semibold text-lg">Tableau de bord conducteur</div>
            <div className="text-sm opacity-90">Gérez vos trajets</div>
          </div>
          <Button 
            size="sm"
            variant="secondary"
            onClick={() => navigate("/publish")}
          >
            Publier
          </Button>
        </div>
      </div>

      {/* Pending Requests Alert */}
      {pendingRequests.length > 0 && (
        <div className="bg-accent/10 border-l-4 border-accent p-4 m-4">
          <p className="text-sm font-medium">
            🔔 {pendingRequests.length} nouvelle(s) demande(s) de réservation
          </p>
        </div>
      )}

      <div className="p-4">
        <Tabs defaultValue="trips" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="trips">Mes trajets</TabsTrigger>
            <TabsTrigger value="bookings">
              Réservations {pendingRequests.length > 0 && `(${pendingRequests.length})`}
            </TabsTrigger>
          </TabsList>
          
          {/* My Trips Tab */}
          <TabsContent value="trips" className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : (
              <>
                <h3 className="font-semibold mb-2">Trajets actifs</h3>
                {activeTrips.length > 0 ? (
                  activeTrips.map(trip => (
                    <Card key={trip.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{trip.departure}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-semibold">{trip.destination}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {format(new Date(trip.departure_time), "dd MMM yyyy • HH:mm", { locale: fr })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {trip.available_seats} places
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">{trip.price_per_seat} CFA</div>
                          <div className="text-xs text-muted-foreground">/place</div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Aucun trajet actif</p>
                    <Button onClick={() => navigate("/publish")}>
                      Publier un trajet
                    </Button>
                  </Card>
                )}

                {pastTrips.length > 0 && (
                  <>
                    <h3 className="font-semibold mt-6 mb-2">Trajets passés</h3>
                    {pastTrips.map(trip => (
                      <Card key={trip.id} className="p-4 opacity-70">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{trip.departure}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-semibold">{trip.destination}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(trip.departure_time), "dd MMM yyyy", { locale: fr })}
                        </div>
                      </Card>
                    ))}
                  </>
                )}
              </>
            )}
          </TabsContent>
          
          {/* Booking Requests Tab */}
          <TabsContent value="bookings" className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : bookingRequests.length > 0 ? (
              <>
                {pendingRequests.length > 0 && (
                  <>
                    <h3 className="font-semibold mb-2">En attente</h3>
                    {pendingRequests.map(booking => (
                      <Card key={booking.id} className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {booking.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-semibold">{booking.profiles?.full_name || 'Passager'}</div>
                            <div className="text-sm text-muted-foreground">
                              {booking.trips?.departure} → {booking.trips?.destination}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Users className="w-3 h-3" />
                              {booking.seats_booked} place(s)
                              <DollarSign className="w-3 h-3 ml-2" />
                              {booking.total_price} CFA
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 gap-2"
                            onClick={() => handleBookingAction(booking.id, 'confirmed')}
                          >
                            <Check className="w-4 h-4" />
                            Accepter
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 gap-2"
                            onClick={() => handleBookingAction(booking.id, 'cancelled')}
                          >
                            <X className="w-4 h-4" />
                            Refuser
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </>
                )}

                {bookingRequests.filter(b => b.status !== 'pending').length > 0 && (
                  <>
                    <h3 className="font-semibold mt-6 mb-2">Historique</h3>
                    {bookingRequests
                      .filter(b => b.status !== 'pending')
                      .map(booking => (
                        <Card key={booking.id} className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-muted text-xs">
                                {booking.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'P'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{booking.profiles?.full_name || 'Passager'}</div>
                              <div className="text-xs text-muted-foreground">
                                {booking.seats_booked} place(s) • {booking.total_price} CFA
                              </div>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              booking.status === 'confirmed' 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {booking.status === 'confirmed' ? 'Accepté' : 'Refusé'}
                            </div>
                          </div>
                        </Card>
                      ))}
                  </>
                )}
              </>
            ) : (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Aucune réservation</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default DriverDashboard;
