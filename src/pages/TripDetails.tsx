import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Star, MapPin, Clock, Users, Car, Phone, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seats, setSeats] = useState(1);

  // Mock data
  const trip = {
    id: 1,
    driver: {
      name: "Kofi Mensah",
      rating: 4.9,
      trips: 127,
      phone: "+229 96 12 34 56"
    },
    from: { city: "Cotonou", country: "🇧🇯", address: "Carrefour Cadjehoun" },
    to: { city: "Lomé", country: "🇹🇬", address: "Gare Routière" },
    time: "14:30",
    date: "Aujourd'hui, 15 Nov 2025",
    duration: "1h 30min",
    price: 5000,
    availableSeats: 3,
    totalSeats: 4,
    vehicle: {
      model: "Toyota Corolla 2020",
      color: "Blanc",
      plate: "BJ-123-AB"
    },
    comfort: ["Climatisation", "Musique", "Coffre spacieux"],
    meetingPoint: "Parking Carrefour Cadjehoun, près de la station Total",
    description: "Trajet direct sans arrêts. Départ à l'heure précise.",
    rules: ["Non-fumeur", "Max 1 bagage par personne", "Animaux non acceptés"]
  };

  const handleBook = () => {
    const total = trip.price * seats;
    toast.success(`Réservation confirmée ! Total: ${total} CFA`, {
      description: `${seats} place(s) réservée(s) pour ${trip.date}`
    });
    navigate("/bookings");
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="font-semibold text-lg">Détails du trajet</div>
            <div className="text-sm opacity-90">
              {trip.from.city} → {trip.to.city}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Driver Card */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {trip.driver.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-bold text-lg">{trip.driver.name}</div>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  {trip.driver.rating}
                </span>
                <span>•</span>
                <span className="text-muted-foreground">{trip.driver.trips} trajets</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-2">
              <Phone className="w-4 h-4" />
              Appeler
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <MessageCircle className="w-4 h-4" />
              Message
            </Button>
          </div>
        </Card>

        {/* Trip Route */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Itinéraire
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <div className="w-0.5 h-16 bg-border"></div>
              </div>
              <div className="flex-1">
                <div className="font-semibold">{trip.from.city} {trip.from.country}</div>
                <div className="text-sm text-muted-foreground">{trip.from.address}</div>
                <div className="text-sm font-medium mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {trip.time} • {trip.date}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
              </div>
              <div className="flex-1">
                <div className="font-semibold">{trip.to.city} {trip.to.country}</div>
                <div className="text-sm text-muted-foreground">{trip.to.address}</div>
                <div className="text-sm font-medium mt-1 text-muted-foreground">
                  Durée: {trip.duration}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Vehicle Info */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            Véhicule
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Modèle</span>
              <span className="font-medium">{trip.vehicle.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Couleur</span>
              <span className="font-medium">{trip.vehicle.color}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Immatriculation</span>
              <span className="font-medium">{trip.vehicle.plate}</span>
            </div>
          </div>
        </Card>

        {/* Comfort & Rules */}
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Confort</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {trip.comfort.map((item, idx) => (
              <span key={idx} className="text-xs bg-muted px-3 py-1 rounded-full">
                {item}
              </span>
            ))}
          </div>

          <h3 className="font-semibold mb-2">Règles du trajet</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            {trip.rules.map((rule, idx) => (
              <li key={idx}>• {rule}</li>
            ))}
          </ul>
        </Card>

        {/* Booking Section */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Prix par place</div>
              <div className="text-3xl font-bold text-primary">{trip.price} CFA</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Places disponibles</div>
              <div className="text-2xl font-bold">{trip.availableSeats}/{trip.totalSeats}</div>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Nombre de places</label>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setSeats(Math.max(1, seats - 1))}
                disabled={seats <= 1}
              >
                -
              </Button>
              <div className="flex-1 text-center">
                <span className="text-2xl font-bold">{seats}</span>
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setSeats(Math.min(trip.availableSeats, seats + 1))}
                disabled={seats >= trip.availableSeats}
              >
                +
              </Button>
            </div>
          </div>

          <div className="border-t pt-3 mb-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{trip.price * seats} CFA</span>
            </div>
          </div>

          <Button onClick={handleBook} size="lg" className="w-full">
            Réserver {seats} place{seats > 1 ? 's' : ''}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default TripDetails;
