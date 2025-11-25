import { Home, Car, User, Plus, Calendar } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg safe-bottom">
      <div className="flex items-center justify-around p-2 max-w-md mx-auto">
        <Button
          variant="ghost"
          size="icon"
          className="flex-col h-auto py-2 text-muted-foreground relative"
          onClick={() => navigate("/")}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Accueil</span>
          {isActive("/") && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="flex-col h-auto py-2 text-muted-foreground relative"
          onClick={() => navigate("/driver")}
        >
          <Car className="w-6 h-6" />
          <span className="text-xs mt-1">Conducteur</span>
          {isActive("/driver") && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />}
        </Button>

        <Button
          variant="default"
          size="icon"
          className="rounded-full w-14 h-14 -mt-6 shadow-lg"
          onClick={() => navigate("/publish")}
        >
          <Plus className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="flex-col h-auto py-2 text-muted-foreground relative"
          onClick={() => navigate("/bookings")}
        >
          <Calendar className="w-6 h-6" />
          <span className="text-xs mt-1">Réservations</span>
          {isActive("/bookings") && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="flex-col h-auto py-2 text-muted-foreground relative"
          onClick={() => navigate("/profile")}
        >
          <User className="w-6 h-6" />
          <span className="text-xs mt-1">Profil</span>
          {isActive("/profile") && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />}
        </Button>
      </div>
    </div>
  );
};
