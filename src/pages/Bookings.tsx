import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Clock, Star, Calendar } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

const Bookings = () => {
  const navigate = useNavigate();

  const upcomingTrips = [
    {
      id: 1,
      from: "Cotonou 🇧🇯",
      to: "Lomé 🇹🇬",
      date: "15 Nov 2025",
      time: "14:30",
      driver: "Kofi Mensah",
      rating: 4.9,
      price: "5000 CFA",
      seats: 2,
      status: "confirmed"
    }
  ];

  const pastTrips = [
    {
      id: 2,
      from: "Lomé 🇹🇬",
      to: "Accra 🇬🇭",
      date: "10 Nov 2025",
      time: "09:00",
      driver: "Ama Diop",
      rating: 5.0,
      price: "8000 CFA",
      seats: 1,
      status: "completed"
    },
    {
      id: 3,
      from: "Abidjan 🇨🇮",
      to: "Cotonou 🇧🇯",
      date: "5 Nov 2025",
      time: "15:00",
      driver: "Kwame Asante",
      rating: 4.7,
      price: "12000 CFA",
      seats: 1,
      status: "completed"
    }
  ];

  const TripCard = ({ trip, isPast = false }: any) => (
    <Card 
      className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/trip/${trip.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">{trip.from}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-semibold">{trip.to}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {trip.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {trip.time}
            </span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          trip.status === 'confirmed' 
            ? 'bg-primary/10 text-primary' 
            : 'bg-muted text-muted-foreground'
        }`}>
          {trip.status === 'confirmed' ? 'Confirmé' : 'Terminé'}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {trip.driver.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium">{trip.driver}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-3 h-3 fill-accent text-accent" />
              {trip.rating}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-primary">{trip.price}</div>
          <div className="text-xs text-muted-foreground">{trip.seats} place(s)</div>
        </div>
      </div>
    </Card>
  );

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
            {upcomingTrips.length > 0 ? (
              upcomingTrips.map(trip => <TripCard key={trip.id} trip={trip} />)
            ) : (
              <Card className="p-8 text-center">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Aucun trajet à venir</p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate("/")}
                >
                  Rechercher un trajet
                </Button>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="space-y-3">
            {pastTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} isPast />
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Bookings;
