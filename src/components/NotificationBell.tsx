import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Notification {
  id: string;
  type: "booking" | "message";
  title: string;
  description: string;
  createdAt: Date;
  read: boolean;
  link?: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch initial unread counts
    fetchInitialNotifications();

    // Subscribe to new bookings (for drivers)
    const bookingsChannel = supabase
      .channel("bookings-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
        },
        async (payload) => {
          // Check if user is the driver of this trip
          const { data: trip } = await supabase
            .from("trips")
            .select("driver_id, departure, destination")
            .eq("id", payload.new.trip_id)
            .single();

          if (trip?.driver_id === user.id) {
            const newNotif: Notification = {
              id: `booking-${payload.new.id}`,
              type: "booking",
              title: "Nouvelle réservation",
              description: `${trip.departure} → ${trip.destination}`,
              createdAt: new Date(),
              read: false,
              link: "/driver",
            };
            setNotifications((prev) => [newNotif, ...prev]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
        },
        async (payload) => {
          // Notify passenger about status change
          if (
            payload.new.passenger_id === user.id &&
            payload.old.status !== payload.new.status
          ) {
            const { data: trip } = await supabase
              .from("trips")
              .select("departure, destination")
              .eq("id", payload.new.trip_id)
              .single();

            const statusMessages: Record<string, string> = {
              confirmed: "Réservation confirmée",
              cancelled: "Réservation refusée",
            };

            const title = statusMessages[payload.new.status];
            if (title) {
              const newNotif: Notification = {
                id: `booking-update-${payload.new.id}-${Date.now()}`,
                type: "booking",
                title,
                description: `${trip?.departure} → ${trip?.destination}`,
                createdAt: new Date(),
                read: false,
                link: "/bookings",
              };
              setNotifications((prev) => [newNotif, ...prev]);
            }
          }
        }
      )
      .subscribe();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel("messages-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          // Don't notify for own messages
          if (payload.new.sender_id === user.id) return;

          // Check if user is part of this conversation
          const { data: booking } = await supabase
            .from("bookings")
            .select(
              `
              passenger_id,
              trips (driver_id, departure, destination)
            `
            )
            .eq("id", payload.new.booking_id)
            .single();

          const isPassenger = booking?.passenger_id === user.id;
          const isDriver = booking?.trips?.driver_id === user.id;

          if (isPassenger || isDriver) {
            // Get sender name
            const { data: sender } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", payload.new.sender_id)
              .single();

            const newNotif: Notification = {
              id: `message-${payload.new.id}`,
              type: "message",
              title: `Message de ${sender?.full_name || "Utilisateur"}`,
              description:
                payload.new.content.substring(0, 50) +
                (payload.new.content.length > 50 ? "..." : ""),
              createdAt: new Date(),
              read: false,
              link: `/messages?booking=${payload.new.booking_id}`,
            };
            setNotifications((prev) => [newNotif, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user]);

  const fetchInitialNotifications = async () => {
    if (!user) return;

    // Get recent unread messages
    const { data: messages } = await supabase
      .from("messages")
      .select(
        `
        id,
        content,
        created_at,
        sender_id,
        booking_id,
        read_at
      `
      )
      .neq("sender_id", user.id)
      .is("read_at", null)
      .order("created_at", { ascending: false })
      .limit(10);

    if (messages && messages.length > 0) {
      const messageNotifs: Notification[] = messages.map((msg) => ({
        id: `message-${msg.id}`,
        type: "message" as const,
        title: "Nouveau message",
        description:
          msg.content.substring(0, 50) + (msg.content.length > 50 ? "..." : ""),
        createdAt: new Date(msg.created_at),
        read: false,
        link: `/messages?booking=${msg.booking_id}`,
      }));
      setNotifications((prev) => [...prev, ...messageNotifs]);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notif: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Tout marquer lu
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.slice(0, 10).map((notif) => (
              <div
                key={notif.id}
                className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                  !notif.read ? "bg-primary/5" : ""
                }`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      !notif.read ? "bg-primary" : "bg-transparent"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{notif.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {notif.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(notif.createdAt, "dd MMM à HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune notification</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
