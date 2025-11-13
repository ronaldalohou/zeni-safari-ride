import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Star, Users, Clock, MapPin } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const from = searchParams.get("from") || "Cotonou";
  const to = searchParams.get("to") || "Lomé";

  // Mock data - remplacer par API
  const trips = [
    {
      id: 1,
      driver: { name: "Kofi Mensah", rating: 4.9, trips: 127 },
      from: "Cotonou 🇧🇯",
      to: "Lomé 🇹🇬",
      time: "14:30",
      date: "Aujourd'hui",
      price: "5000 CFA",
      seats: 3,
      vehicle: "Toyota Corolla",
      comfort: "Climatisation, Musique"
    },
    {
      id: 2,
      driver: { name: "Ama Diop", rating: 5.0, trips: 89 },
      from: "Cotonou 🇧🇯",
      to: "Lomé 🇹🇬",
      time: "16:00",
      date: "Aujourd'hui",
      price: "4500 CFA",
      seats: 2,
      vehicle: "Honda Civic",
      comfort: "Climatisation"
    },
    {
      id: 3,
      driver: { name: "Kwame Asante", rating: 4.7, trips: 203 },
      from: "Cotonou 🇧🇯",
      to: "Lomé 🇹🇬",
      time: "18:30",
      date: "Aujourd'hui",
      price: "5500 CFA",
      seats: 4,
      vehicle: "Mercedes Classe C",
      comfort: "Climatisation, WiFi, Confort premium"
    }
  ];

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
            <div className="text-sm opacity-90">
              {from} → {to}
            </div>
            <div className="font-semibold">{trips.length} trajets disponibles</div>
          </div>
        </div>
      </div>

      {/* Trip List */}
      <div className="p-4 space-y-4">
        {trips.map((trip) => (
          <Card 
            key={trip.id}
            className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/trip/${trip.id}`)}
          >
            {/* Driver Info */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {trip.driver.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold">{trip.driver.name}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    {trip.driver.rating}
                  </span>
                  <span>•</span>
                  <span>{trip.driver.trips} trajets</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{trip.price}</div>
                <div className="text-xs text-muted-foreground">par personne</div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{trip.time}</span>
                <span className="text-muted-foreground">• {trip.date}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{trip.from} → {trip.to}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{trip.seats} places disponibles</span>
              </div>

              <div className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                <span className="font-medium">{trip.vehicle}</span> • {trip.comfort}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Search;
