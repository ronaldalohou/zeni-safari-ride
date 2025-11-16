import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, MapPin, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BottomNav } from "@/components/BottomNav";

export default function Home() {
  const [date, setDate] = useState<Date>();
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSearch = () => {
    if (departure && destination) {
      navigate(`/search?from=${departure}&to=${destination}`);
    }
  };

  const popularRoutes = [
    { from: "Cotonou 🇧🇯", to: "Lomé 🇹🇬", price: "5000 CFA" },
    { from: "Abidjan 🇨🇮", to: "Accra 🇬🇭", price: "15000 CFA" },
    { from: "Lomé 🇹🇬", to: "Cotonou 🇧🇯", price: "5000 CFA" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-secondary text-white p-6 rounded-b-3xl">
        <h1 className="text-3xl font-bold mb-2">🚗 ZeMi</h1>
        <p className="text-white/90">Voyagez ensemble, économisez ensemble</p>
      </div>

      <div className="p-4 -mt-8">
        <Card className="p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-4">Rechercher un trajet</h2>
          
          <div className="space-y-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Ville de départ"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="pl-10"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={fr} />
              </PopoverContent>
            </Popover>

            <Button onClick={handleSearch} className="w-full" size="lg">
              Rechercher
            </Button>
          </div>
        </Card>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Trajets populaires 🔥</h2>
        <div className="space-y-3">
          {popularRoutes.map((route, idx) => (
            <Card key={idx} className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/search?from=${route.from}&to=${route.to}`)}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{route.from}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-semibold">{route.to}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Users className="w-4 h-4 inline mr-1" />
                    Plusieurs places disponibles
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">{route.price}</div>
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
}
