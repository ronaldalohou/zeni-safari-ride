import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, CheckCircle, XCircle, Clock } from 'lucide-react';

type DocumentType = 'id_card' | 'passport' | 'driver_license';
type VerificationStatus = 'pending' | 'approved' | 'rejected';

interface Verification {
  id: string;
  document_type: DocumentType;
  status: VerificationStatus;
  created_at: string;
  rejection_reason?: string;
}

export default function VerifyIdentity() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<DocumentType>('id_card');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState<Verification | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchVerification();
  }, [user, navigate]);

  const fetchVerification = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('identity_verification')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setVerification(data as Verification);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('Le fichier ne doit pas dépasser 5 MB');
        return;
      }

      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image');
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !user) return;

    try {
      setLoading(true);

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('identity-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('identity-documents')
        .getPublicUrl(fileName);

      // Create verification record
      const { error: insertError } = await supabase
        .from('identity_verification')
        .insert({
          user_id: user.id,
          document_type: selectedType,
          document_url: publicUrl,
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast.success('Document envoyé ! En attente de vérification ⏳');
      fetchVerification();
      setFile(null);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'upload');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-success w-6 h-6" />;
      case 'rejected':
        return <XCircle className="text-destructive w-6 h-6" />;
      case 'pending':
        return <Clock className="text-warning w-6 h-6" />;
    }
  };

  const getStatusText = (status: VerificationStatus) => {
    switch (status) {
      case 'approved':
        return 'Identité vérifiée ✓';
      case 'rejected':
        return 'Document rejeté';
      case 'pending':
        return 'En attente de vérification';
    }
  };

  const documentTypes = [
    { value: 'id_card', label: '🪪 Carte d\'identité' },
    { value: 'passport', label: '📘 Passeport' },
    { value: 'driver_license', label: '🚗 Permis de conduire' }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-secondary p-6 text-white">
        <h1 className="text-2xl font-bold">Vérification d'identité</h1>
        <p className="text-white/90 mt-1">Sécurisez votre compte</p>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {verification && (
          <Card className="p-6">
            <div className="flex items-center gap-4">
              {getStatusIcon(verification.status)}
              <div className="flex-1">
                <h3 className="font-semibold">{getStatusText(verification.status)}</h3>
                <p className="text-sm text-muted-foreground">
                  Document : {documentTypes.find(t => t.value === verification.document_type)?.label}
                </p>
                {verification.rejection_reason && (
                  <p className="text-sm text-destructive mt-2">
                    Raison : {verification.rejection_reason}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        {(!verification || verification.status === 'rejected') && (
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Type de document
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  {documentTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSelectedType(type.value as DocumentType)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedType === type.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="document" className="text-base font-semibold mb-3 block">
                  Uploader le document
                </Label>
                <div className="relative">
                  <input
                    id="document"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="document"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {file ? file.name : 'Cliquez pour sélectionner une image'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 5 MB - JPG, PNG
                    </p>
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!file || loading}
              >
                {loading ? 'Envoi en cours...' : 'Soumettre pour vérification'}
              </Button>
            </form>
          </Card>
        )}

        <div className="bg-info/10 border border-info/20 rounded-lg p-4">
          <h3 className="font-semibold text-info mb-2">ℹ️ Pourquoi vérifier mon identité ?</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Augmenter la confiance des autres utilisateurs</li>
            <li>• Accéder à plus de fonctionnalités</li>
            <li>• Sécuriser votre compte et vos trajets</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
