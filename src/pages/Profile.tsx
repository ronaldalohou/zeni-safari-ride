import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Car, MapPin, Settings, LogOut, Phone, Mail } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  // Mock user data
  const user = {
    name: "Jean Kouassi",
    email: "jean.kouassi@example.com",
    phone: "+225 07 12 34 56 78",
    rating: 4.8,
    totalTrips: 45,
    asDriver: 23,
    asPassenger: 22,
    memberSince: "Mars 2024"
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Mon Profil</h1>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20 border-4 border-primary-foreground/20">
            <AvatarFallback className="bg-primary-foreground text-primary text-2xl">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-xl font-bold">{user.name}</div>
            <div className="flex items-center gap-1 text-sm opacity-90">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="font-semibold">{user.rating}</span>
              <span className="ml-1">• {user.totalTrips} trajets</span>
            </div>
            <div className="text-sm opacity-75 mt-1">
              Membre depuis {user.memberSince}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 -mt-6">
        {/* Stats Card */}
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <Car className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{user.asDriver}</div>
              <div className="text-sm text-muted-foreground">En conducteur</div>
            </div>
            <div className="text-center p-3 bg-secondary/5 rounded-lg">
              <MapPin className="w-6 h-6 mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-bold">{user.asPassenger}</div>
              <div className="text-sm text-muted-foreground">En passager</div>
            </div>
          </div>
        </Card>

        {/* Contact Info */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Informations de contact</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{user.phone}</span>
            </div>
          </div>
        </Card>

        {/* Menu Items */}
        <Card className="divide-y">
          <Button 
            variant="ghost" 
            className="w-full justify-start p-4 h-auto"
            onClick={() => navigate("/bookings")}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Mes réservations</div>
                <div className="text-sm text-muted-foreground">Voir tous mes trajets</div>
              </div>
            </div>
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start p-4 h-auto"
            onClick={() => navigate("/publish")}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Car className="w-5 h-5 text-secondary" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Publier un trajet</div>
                <div className="text-sm text-muted-foreground">Proposer un covoiturage</div>
              </div>
            </div>
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start p-4 h-auto"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Paramètres</div>
                <div className="text-sm text-muted-foreground">Gérer mon compte</div>
              </div>
            </div>
          </Button>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full gap-2 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
