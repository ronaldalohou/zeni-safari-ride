import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/BottomNav";
import { Star, Calendar, Phone, Mail, ShieldCheck, LogOut } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  full_name: string;
  phone: string;
  photo_url: string;
  rating: number;
  total_trips: number;
  verified: boolean;
  created_at: string;
}

export default function Profile() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    if (error) {
      toast.error('Erreur lors du chargement du profil');
    } else if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Erreur lors de la déconnexion');
    } else {
      toast.success('Déconnexion réussie');
      navigate('/auth');
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Chargement...</p></div>;
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Profil introuvable</p></div>;
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary" />
        <div className="relative p-6 flex items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-white">
            <AvatarImage src={profile.photo_url || undefined} />
            <AvatarFallback>{profile.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-white">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              {profile.verified && <ShieldCheck className="w-5 h-5 text-success" />}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-warning text-warning mr-1" />
                <span className="font-semibold">{profile.rating.toFixed(1)}</span>
              </div>
              <span className="text-white/80">• {profile.total_trips} trajets</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Informations personnelles</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <span>{profile.phone || 'Non renseigné'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span>Membre depuis {memberSince}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className={`w-6 h-6 ${profile.verified ? 'text-success' : 'text-muted-foreground'}`} />
            <h2 className="text-lg font-semibold">Vérification d'identité</h2>
          </div>
          {profile.verified ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">Votre identité a été vérifiée.</p>
              <Badge variant="secondary" className="bg-success/10 text-success">✓ Identité vérifiée</Badge>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">Vérifiez votre identité pour augmenter la confiance.</p>
              <Button onClick={() => navigate('/verify-identity')} variant="outline" className="w-full">Vérifier mon identité</Button>
            </>
          )}
        </Card>

        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Se déconnecter
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
