import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';

type DocumentType = 'id_card' | 'passport' | 'driver_license';
type VerificationStatus = 'pending' | 'approved' | 'rejected';

interface Verification {
  id: string;
  user_id: string;
  document_type: DocumentType;
  document_url: string;
  selfie_url: string | null;
  status: VerificationStatus;
  created_at: string;
  rejection_reason?: string;
}

interface Profile {
  full_name: string;
  phone: string | null;
}

export default function AdminVerification() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    checkAdminAndFetchVerifications();
  }, [user, navigate]);

  const checkAdminAndFetchVerifications = async () => {
    if (!user) return;

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (!profile?.is_admin) {
      toast.error('Accès refusé - Administrateurs uniquement');
      navigate('/');
      return;
    }

    fetchVerifications();
  };

  const fetchVerifications = async () => {
    setLoading(true);
    
    const { data: verifs, error } = await supabase
      .from('identity_verification')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erreur lors du chargement des vérifications');
      setLoading(false);
      return;
    }

    if (verifs) {
      setVerifications(verifs as Verification[]);
      
      // Fetch user profiles
      const userIds = [...new Set(verifs.map(v => v.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone')
        .in('user_id', userIds);

      if (profilesData) {
        const profilesMap: Record<string, Profile> = {};
        profilesData.forEach((p: any) => {
          profilesMap[p.user_id] = {
            full_name: p.full_name,
            phone: p.phone
          };
        });
        setProfiles(profilesMap);
      }
    }
    
    setLoading(false);
  };

  const handleApprove = async (verification: Verification) => {
    setProcessing(true);
    
    try {
      // Update verification status
      const { error: verifError } = await supabase
        .from('identity_verification')
        .update({ 
          status: 'approved',
          verified_at: new Date().toISOString()
        })
        .eq('id', verification.id);

      if (verifError) throw verifError;

      // Update user profile to verified
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ verified: true })
        .eq('user_id', verification.user_id);

      if (profileError) throw profileError;

      toast.success('Vérification approuvée ✓');
      setSelectedVerification(null);
      fetchVerifications();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'approbation');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (verification: Verification) => {
    if (!rejectionReason.trim()) {
      toast.error('Veuillez indiquer la raison du rejet');
      return;
    }

    setProcessing(true);
    
    try {
      const { error } = await supabase
        .from('identity_verification')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionReason
        })
        .eq('id', verification.id);

      if (error) throw error;

      toast.success('Vérification rejetée');
      setSelectedVerification(null);
      setRejectionReason('');
      fetchVerifications();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du rejet');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success/10 text-success border-success/20">✓ Approuvé</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">✗ Rejeté</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning border-warning/20">⏳ En attente</Badge>;
    }
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    switch (type) {
      case 'id_card': return '🪪 Carte d\'identité';
      case 'passport': return '📘 Passeport';
      case 'driver_license': return '🚗 Permis de conduire';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (selectedVerification) {
    const profile = profiles[selectedVerification.user_id];
    
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-gradient-to-br from-primary to-secondary p-6 text-white">
          <Button
            variant="ghost"
            className="text-white mb-4 hover:bg-white/20"
            onClick={() => {
              setSelectedVerification(null);
              setRejectionReason('');
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Vérification d'identité</h1>
          <p className="text-white/90 mt-1">{profile?.full_name}</p>
        </div>

        <div className="p-4 space-y-4 max-w-4xl mx-auto">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Informations</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Nom :</strong> {profile?.full_name}</p>
                  <p><strong>Téléphone :</strong> {profile?.phone || 'Non renseigné'}</p>
                  <p><strong>Type :</strong> {getDocumentTypeLabel(selectedVerification.document_type)}</p>
                  <p><strong>Date :</strong> {new Date(selectedVerification.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedVerification.selfie_url && (
                  <div>
                    <h4 className="font-semibold mb-2">📸 Selfie</h4>
                    <img
                      src={selectedVerification.selfie_url}
                      alt="Selfie"
                      className="w-full h-64 object-cover rounded-lg border"
                    />
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold mb-2">🪪 Document</h4>
                  <img
                    src={selectedVerification.document_url}
                    alt="Document"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                </div>
              </div>
            </div>
          </Card>

          {selectedVerification.status === 'pending' && (
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rejection-reason">Raison du rejet (optionnel si rejet)</Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Ex: Photo floue, document expiré..."
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleReject(selectedVerification)}
                    variant="destructive"
                    className="flex-1"
                    disabled={processing}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeter
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedVerification)}
                    className="flex-1 bg-success hover:bg-success/90"
                    disabled={processing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approuver
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  const pendingCount = verifications.filter(v => v.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-secondary p-6 text-white">
        <h1 className="text-2xl font-bold">Administration</h1>
        <p className="text-white/90 mt-1">Gestion des vérifications d'identité</p>
      </div>

      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Vérifications en attente</h3>
              <p className="text-sm text-muted-foreground">{pendingCount} demande(s) à traiter</p>
            </div>
            <Clock className="w-8 h-8 text-warning" />
          </div>
        </Card>

        <div className="space-y-3">
          {verifications.map((verification) => {
            const profile = profiles[verification.user_id];
            
            return (
              <Card
                key={verification.id}
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => setSelectedVerification(verification)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{profile?.full_name || 'Utilisateur'}</h4>
                    <p className="text-sm text-muted-foreground">
                      {getDocumentTypeLabel(verification.document_type)} • {' '}
                      {new Date(verification.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {getStatusBadge(verification.status)}
                </div>
              </Card>
            );
          })}

          {verifications.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Aucune vérification pour le moment</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
