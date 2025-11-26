import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface ChatWindowProps {
  bookingId: string;
  onBack: () => void;
}

export const ChatWindow = ({ bookingId, onBack }: ChatWindowProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [booking, setBooking] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchChatData();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`messages-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`
        },
        (payload) => {
          console.log('New message:', payload);
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatData = async () => {
    if (!user) return;

    try {
      // Get booking with trip info
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          trips (
            id,
            departure,
            destination,
            departure_time,
            driver_id
          )
        `)
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;
      setBooking(bookingData);

      // Determine the other user
      const otherUserId = bookingData.passenger_id === user.id 
        ? bookingData.trips?.driver_id 
        : bookingData.passenger_id;

      // Get other user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', otherUserId)
        .single();

      setOtherUser(profileData);

      // Get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

      // Mark unread messages as read
      const unreadMessages = messagesData?.filter(
        m => !m.read_at && m.sender_id !== user.id
      );
      
      if (unreadMessages && unreadMessages.length > 0) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadMessages.map(m => m.id));
      }

    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error("Impossible de charger la conversation");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          booking_id: bookingId,
          sender_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error("Impossible d'envoyer le message");
    } finally {
      setSending(false);
    }
  };

  const isMyMessage = (senderId: string) => senderId === user?.id;

  return (
    <div className="h-screen flex flex-col bg-background safe-bottom">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 pt-4 safe-top flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onBack}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground">
              {otherUser?.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-semibold">{otherUser?.full_name || 'Chargement...'}</div>
            <div className="text-xs opacity-90">
              {booking?.trips?.departure} → {booking?.trips?.destination}
            </div>
          </div>
          {otherUser?.phone && (
            <Button 
              variant="ghost" 
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/20"
              asChild
            >
              <a href={`tel:${otherUser.phone}`}>
                <Phone className="w-5 h-5" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Chargement...</div>
        ) : messages.length > 0 ? (
          <>
            {/* Trip info banner */}
            <div className="bg-muted rounded-lg p-3 text-center text-sm mb-4">
              <div className="font-medium">{booking?.trips?.departure} → {booking?.trips?.destination}</div>
              <div className="text-muted-foreground">
                {booking?.trips?.departure_time && format(
                  new Date(booking.trips.departure_time), 
                  "EEEE d MMMM yyyy • HH:mm", 
                  { locale: fr }
                )}
              </div>
            </div>

            {messages.map((message, index) => {
              const showDate = index === 0 || 
                format(new Date(message.created_at), 'yyyy-MM-dd') !== 
                format(new Date(messages[index - 1].created_at), 'yyyy-MM-dd');

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="text-center text-xs text-muted-foreground my-4">
                      {format(new Date(message.created_at), "EEEE d MMMM", { locale: fr })}
                    </div>
                  )}
                  <div className={`flex ${isMyMessage(message.sender_id) ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      isMyMessage(message.sender_id) 
                        ? 'bg-primary text-primary-foreground rounded-br-md' 
                        : 'bg-muted rounded-bl-md'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isMyMessage(message.sender_id) 
                          ? 'text-primary-foreground/70' 
                          : 'text-muted-foreground'
                      }`}>
                        {format(new Date(message.created_at), "HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="text-center py-8">
            <div className="bg-muted rounded-lg p-3 text-sm mb-4">
              <div className="font-medium">{booking?.trips?.departure} → {booking?.trips?.destination}</div>
              <div className="text-muted-foreground">
                {booking?.trips?.departure_time && format(
                  new Date(booking.trips.departure_time), 
                  "EEEE d MMMM yyyy • HH:mm", 
                  { locale: fr }
                )}
              </div>
            </div>
            <p className="text-muted-foreground">Aucun message</p>
            <p className="text-sm text-muted-foreground mt-1">
              Envoyez un message pour commencer la conversation
            </p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4 flex-shrink-0 bg-background">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1"
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};