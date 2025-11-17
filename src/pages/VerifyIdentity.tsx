import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, CheckCircle, XCircle, Clock, ArrowLeft, Shield } from 'lucide-react';

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
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<DocumentType>('id_card');
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState<Verification | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      fetchVerification();
    }
  }, [user, authLoading, navigate]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'selfie' | 'document') => {
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

      if (type === 'selfie') {
        setSelfieFile(selectedFile);
      } else {
        setDocumentFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selfieFile || !documentFile || !user) {
      toast.error('Veuillez télécharger votre selfie ET votre pièce d\'identité');
      return;
    }

    try {
      setLoading(true);

      // Upload selfie
      const selfieExt = selfieFile.name.split('.').pop();
      const selfieName = `${user.id}/selfie_${Date.now()}.${selfieExt}`;
      
      const { error: selfieUploadError } = await supabase.storage
        .from('identity-documents')
        .upload(selfieName, selfieFile);

      if (selfieUploadError) throw selfieUploadError;

      // Upload document
      const docExt = documentFile.name.split('.').pop();
      const docName = `${user.id}/document_${Date.now()}.${docExt}`;
      
      const { error: docUploadError } = await supabase.storage
        .from('identity-documents')
        .upload(docName, documentFile);

      if (docUploadError) throw docUploadError;

      // Get public URLs
      const { data: { publicUrl: selfieUrl } } = supabase.storage
        .from('identity-documents')
        .getPublicUrl(selfieName);

      const { data: { publicUrl: docUrl } } = supabase.storage
        .from('identity-documents')
        .getPublicUrl(docName);

      // Create verification record
      const { error: insertError } = await supabase
        .from('identity_verification')
        .insert({
          user_id: user.id,
          document_type: selectedType,
          document_url: docUrl,
          selfie_url: selfieUrl,
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast.success('Documents envoyés ! En attente de vérification ⏳');
      fetchVerification();
      setSelfieFile(null);
      setDocumentFile(null);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20">
      {/* Header moderne avec bouton retour */}
      <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 p-6 text-white shadow-lg">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-6 flex items-center gap-2 text-white/90 hover:text-white transition-all hover:gap-3 group"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Retour</span>
        </button>
        
        <div className="max-w-2xl mx-auto pt-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Vérification d'identité</h1>
              <p className="text-white/90 mt-1 text-sm">Sécurisez votre compte en quelques étapes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-2xl mx-auto -mt-6">
        {verification && (
          <Card className="p-6 shadow-xl border-2 animate-fade-in bg-card/80 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                {getStatusIcon(verification.status)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{getStatusText(verification.status)}</h3>
                <p className="text-sm text-muted-foreground">
                  Document : {documentTypes.find(t => t.value === verification.document_type)?.label}
                </p>
                {verification.rejection_reason && (
                  <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive font-medium">
                      Raison : {verification.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {(!verification || verification.status === 'rejected') && (
          <Card className="p-8 shadow-xl border-0 animate-fade-in bg-card/80 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <Label className="text-lg font-bold mb-4 block flex items-center gap-2">
                  <span className="text-2xl">📄</span>
                  Type de document
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  {documentTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSelectedType(type.value as DocumentType)}
                      className={`p-5 rounded-2xl border-2 transition-all text-left font-medium hover:scale-[1.02] hover:shadow-lg ${
                        selectedType === type.value
                          ? 'border-primary bg-primary/10 shadow-md scale-[1.02]'
                          : 'border-border hover:border-primary/50 bg-card'
                      }`}
                    >
                      <span className="text-lg">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="selfie" className="text-lg font-bold mb-4 block flex items-center gap-2">
                  <span className="text-2xl">📸</span>
                  Photo de votre visage (Selfie)
                </Label>
                <div className="relative">
                  <input
                    id="selfie"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'selfie')}
                    className="hidden"
                  />
                  <label
                    htmlFor="selfie"
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all hover:scale-[1.01] ${
                      selfieFile 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    <Upload className="w-12 h-12 text-primary mb-3" />
                    <p className="text-base font-medium text-foreground px-4 text-center">
                      {selfieFile ? `✓ ${selfieFile.name}` : 'Prenez un selfie clair de votre visage'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Max 5 MB • JPG, PNG
                    </p>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="document" className="text-lg font-bold mb-4 block flex items-center gap-2">
                  <span className="text-2xl">🪪</span>
                  Photo de la pièce d'identité
                </Label>
                <div className="relative">
                  <input
                    id="document"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'document')}
                    className="hidden"
                  />
                  <label
                    htmlFor="document"
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all hover:scale-[1.01] ${
                      documentFile 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    <Upload className="w-12 h-12 text-primary mb-3" />
                    <p className="text-base font-medium text-foreground px-4 text-center">
                      {documentFile ? `✓ ${documentFile.name}` : 'Photo recto/verso du document'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Max 5 MB • JPG, PNG
                    </p>
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                disabled={!selfieFile || !documentFile || loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Envoi en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Soumettre pour vérification
                  </span>
                )}
              </Button>
            </form>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 p-6 shadow-lg animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/20 rounded-full">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3 text-foreground">Pourquoi vérifier mon identité ?</h3>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-bold">✓</span>
                  <span>Augmenter la confiance des autres utilisateurs</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-bold">✓</span>
                  <span>Accéder à plus de fonctionnalités premium</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-bold">✓</span>
                  <span>Sécuriser votre compte et vos trajets</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
