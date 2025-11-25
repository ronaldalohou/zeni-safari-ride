import { Card } from "@/components/ui/card";
import { MapPin, Users, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Trip {
  id: string;
  departure: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  vehicle_model: string;
  driver_id: string;
}

export default function Home() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('status', 'active')
          .gt('available_seats', 0)
          .order('departure_time', { ascending: true });

        if (error) throw error;
        setTrips(data || []);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoadingTrips(false);
      }
    };

    if (user) {
      fetchTrips();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background pb-24 safe-bottom">
      <div className="bg-gradient-to-br from-primary to-secondary text-white p-4 pt-4 safe-top rounded-b-3xl">
        <h1 className="text-2xl font-bold mb-1">🚗 ZeMi</h1>
        <p className="text-sm text-white/90">Trajets disponibles</p>
      </div>

      <div className="p-4">
        <h2 className="text-lg font-bold mb-3">Trajets 🚗</h2>
        
        {loadingTrips ? (
          <div className="text-center py-8 text-muted-foreground">Chargement...</div>
        ) : trips.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun trajet disponible
          </div>
        ) : (
          <div className="space-y-2">
            {trips.map((trip) => (
              <Card 
                key={trip.id} 
                className="p-3 hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => navigate(`/trip/${trip.id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span>{trip.departure}</span>
                      <span className="text-muted-foreground">→</span>
                      <span>{trip.destination}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{trip.price_per_seat} CFA</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(trip.departure_time), "dd MMM HH:mm", { locale: fr })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {trip.available_seats} places
                    </span>
                  </div>
                  <span>{trip.vehicle_model}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
