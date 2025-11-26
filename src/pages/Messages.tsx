import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { ChatWindow } from "@/components/ChatWindow";

const Messages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingIdParam = searchParams.get('booking');
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(bookingIdParam);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchConversations();
  }, [user, authLoading, navigate]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // Get all bookings where user is passenger
      const { data: passengerBookings, error: passengerError } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          trips (
            id,
            departure,
            destination,
            departure_time,
            driver_id
          )
        `)
        .eq('passenger_id', user.id)
        .neq('status', 'cancelled');

      if (passengerError) throw passengerError;

      // Get all bookings where user is driver
      const { data: driverTrips, error: driverError } = await supabase
        .from('trips')
        .select('id')
        .eq('driver_id', user.id);

      if (driverError) throw driverError;

      const tripIds = driverTrips?.map(t => t.id) || [];
      
      let driverBookings: any[] = [];
      if (tripIds.length > 0) {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            status,
            passenger_id,
            trips (
              id,
              departure,
              destination,
              departure_time,
              driver_id
            )
          `)
          .in('trip_id', tripIds)
          .neq('status', 'cancelled');

        if (error) throw error;
        driverBookings = data || [];
      }

      // Get profiles for all users involved
      const allUserIds = [
        ...new Set([
          ...(passengerBookings?.map(b => b.trips?.driver_id) || []),
          ...(driverBookings?.map(b => b.passenger_id) || [])
        ].filter(Boolean))
      ];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone')
        .in('user_id', allUserIds);

      // Get last message for each booking
      const allBookingIds = [
        ...(passengerBookings?.map(b => b.id) || []),
        ...(driverBookings?.map(b => b.id) || [])
      ];

      let lastMessages: any[] = [];
      if (allBookingIds.length > 0) {
        const { data: messagesData } = await supabase
          .from('messages')
          .select('booking_id, content, created_at, sender_id, read_at')
          .in('booking_id', allBookingIds)
          .order('created_at', { ascending: false });

        // Group by booking_id and get latest
        const messagesByBooking: Record<string, any> = {};
        messagesData?.forEach(msg => {
          if (!messagesByBooking[msg.booking_id]) {
            messagesByBooking[msg.booking_id] = msg;
          }
        });
        lastMessages = Object.values(messagesByBooking);
      }

      // Combine and format conversations
      const formattedConversations = [
        ...(passengerBookings?.map(b => ({
          ...b,
          isDriver: false,
          otherUser: profiles?.find(p => p.user_id === b.trips?.driver_id),
          lastMessage: lastMessages.find(m => m.booking_id === b.id)
        })) || []),
        ...(driverBookings?.map(b => ({
          ...b,
          isDriver: true,
          otherUser: profiles?.find(p => p.user_id === b.passenger_id),
          lastMessage: lastMessages.find(m => m.booking_id === b.id)
        })) || [])
      ].sort((a, b) => {
        const aTime = a.lastMessage?.created_at || a.trips?.departure_time;
        const bTime = b.lastMessage?.created_at || b.trips?.departure_time;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setConversations(formattedConversations);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error("Impossible de charger les conversations");
    } finally {
      setLoading(false);
    }
  };

  if (selectedBooking) {
    return (
      <ChatWindow 
        bookingId={selectedBooking} 
        onBack={() => {
          setSelectedBooking(null);
          navigate('/messages', { replace: true });
        }} 
      />
    );
  }

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
            <div className="font-semibold text-lg">Messages</div>
            <div className="text-sm opacity-90">Vos conversations</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Chargement...</div>
        ) : conversations.length > 0 ? (
          conversations.map(conv => (
            <Card 
              key={conv.id} 
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedBooking(conv.id)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {conv.otherUser?.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold truncate">
                      {conv.otherUser?.full_name || (conv.isDriver ? 'Passager' : 'Conducteur')}
                    </div>
                    {conv.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(conv.lastMessage.created_at), "HH:mm", { locale: fr })}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {conv.trips?.departure} → {conv.trips?.destination}
                  </div>
                  {conv.lastMessage ? (
                    <div className="text-sm text-muted-foreground truncate mt-1">
                      {conv.lastMessage.content}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground/50 italic mt-1">
                      Aucun message
                    </div>
                  )}
                </div>
                {conv.lastMessage && !conv.lastMessage.read_at && conv.lastMessage.sender_id !== user?.id && (
                  <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0"></div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">Aucune conversation</p>
            <p className="text-sm text-muted-foreground">
              Réservez un trajet pour commencer à discuter avec le conducteur
            </p>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Messages;