import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MapPin, Calendar, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Publish = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
    seats: "3",
    price: "",
    vehicle: "",
    vehicleColor: "",
    vehiclePlate: "",
    description: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Vous devez être connecté");
      navigate("/auth");
      return;
    }

    setLoading(true);
    
    try {
      // Combine date and time into a timestamp
      const departureTime = new Date(`${formData.date}T${formData.time}`);
      
      const { error } = await supabase
        .from('trips')
        .insert({
          driver_id: user.id,
          departure: formData.from,
          destination: formData.to,
          departure_time: departureTime.toISOString(),
          available_seats: parseInt(formData.seats),
          price_per_seat: parseFloat(formData.price),
          vehicle_model: formData.vehicle || 'Non spécifié',
          vehicle_color: formData.vehicleColor || null,
          vehicle_plate: formData.vehiclePlate || null,
          description: formData.description || null,
          status: 'active'
        });

      if (error) throw error;

      toast.success("Trajet publié avec succès ! 🎉");
      navigate("/");
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la publication: " + error.message);
    } finally {
      setLoading(false);
    }
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
          <h3 className="font-semibold mb-3">Véhicule</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="vehicle">Modèle</Label>
              <Input
                id="vehicle"
                placeholder="ex: Toyota Corolla"
                value={formData.vehicle}
                onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="vehicleColor">Couleur (optionnel)</Label>
              <Input
                id="vehicleColor"
                placeholder="ex: Blanc"
                value={formData.vehicleColor}
                onChange={(e) => setFormData({...formData, vehicleColor: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="vehiclePlate">Immatriculation (optionnel)</Label>
              <Input
                id="vehiclePlate"
                placeholder="ex: BJ-123-AB"
                value={formData.vehiclePlate}
                onChange={(e) => setFormData({...formData, vehiclePlate: e.target.value})}
              />
            </div>
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
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Publication..." : "Publier le trajet"}
        </Button>
      </form>
    </div>
  );
};

export default Publish;
