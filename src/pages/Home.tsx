import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Users, Star } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

const Home = () => {
  const navigate = useNavigate();
  const [depart, setDepart] = useState("");
  const [destination, setDestination] = useState("");

  const handleSearch = () => {
    if (depart && destination) {
      navigate(`/search?from=${depart}&to=${destination}`);
    }
  };

  // Trajets populaires
  const popularRoutes = [
    { from: "Cotonou 🇧🇯", to: "Lomé 🇹🇬", price: "5000 CFA", seats: 3 },
    { from: "Abidjan 🇨🇮", to: "Accra 🇬🇭", price: "15000 CFA", seats: 2 },
    { from: "Lomé 🇹🇬", to: "Accra 🇬🇭", price: "8000 CFA", seats: 4 },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">🚗 ZeMi</h1>
        <p className="text-sm opacity-90">Voyagez ensemble, économisez ensemble</p>
      </div>

      {/* Search Section */}
      <div className="p-4 -mt-8">
        <Card className="p-6 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Rechercher un trajet
          </h2>
          
          <div className="space-y-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Ville de départ"
                value={depart}
                onChange={(e) => setDepart(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                className="pl-10"
              />
            </div>

            <Button 
              onClick={handleSearch} 
              className="w-full"
              size="lg"
            >
              Rechercher
            </Button>
          </div>
        </Card>
      </div>

      {/* Popular Routes */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Trajets populaires 🔥</h2>
        <div className="space-y-3">
          {popularRoutes.map((route, idx) => (
            <Card 
              key={idx} 
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/search?from=${route.from}&to=${route.to}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{route.from}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-semibold">{route.to}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {route.seats} places
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      4.8
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">{route.price}</div>
                  <div className="text-xs text-muted-foreground">par personne</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
