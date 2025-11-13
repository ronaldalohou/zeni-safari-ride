import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MapPin, Calendar, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";

const Publish = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
    seats: "3",
    price: "",
    vehicle: "",
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Trajet publié avec succès ! 🎉");
    navigate("/");
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
            <div className="font-semibold text-lg">Publier un trajet</div>
            <div className="text-sm opacity-90">Proposez un covoiturage</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Itinerary */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Itinéraire
          </h3>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="from">Départ</Label>
              <Input
                id="from"
                placeholder="Ville de départ"
                value={formData.from}
                onChange={(e) => setFormData({...formData, from: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="to">Destination</Label>
              <Input
                id="to"
                placeholder="Ville d'arrivée"
                value={formData.to}
                onChange={(e) => setFormData({...formData, to: e.target.value})}
                required
              />
            </div>
          </div>
        </Card>

        {/* Date & Time */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Date et heure
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="time">Heure</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
              />
            </div>
          </div>
        </Card>

        {/* Seats & Price */}
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="seats" className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Places disponibles
              </Label>
              <Input
                id="seats"
                type="number"
                min="1"
                max="8"
                value={formData.seats}
                onChange={(e) => setFormData({...formData, seats: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="price" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Prix par place (CFA)
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="5000"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Prix recommandé: 3000-6000 CFA
              </p>
            </div>
          </div>
        </Card>

        {/* Vehicle */}
        <Card className="p-4">
          <div>
            <Label htmlFor="vehicle">Véhicule (optionnel)</Label>
            <Input
              id="vehicle"
              placeholder="ex: Toyota Corolla"
              value={formData.vehicle}
              onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
            />
          </div>
        </Card>

        {/* Description */}
        <Card className="p-4">
          <div>
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Informations supplémentaires sur le trajet..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>
        </Card>

        {/* Submit */}
        <Button type="submit" size="lg" className="w-full">
          Publier le trajet
        </Button>
      </form>
    </div>
  );
};

export default Publish;
