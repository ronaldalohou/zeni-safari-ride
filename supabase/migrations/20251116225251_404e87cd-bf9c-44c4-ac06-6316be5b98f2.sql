-- Add selfie_url column to identity_verification table
ALTER TABLE public.identity_verification
ADD COLUMN selfie_url TEXT;

-- Update the RLS policy to allow admins to view all verifications
CREATE POLICY "Admins can view all verifications"
ON public.identity_verification
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.verified = true
  )
);

-- Update the RLS policy to allow admins to update verifications
CREATE POLICY "Admins can update all verifications"
ON public.identity_verification
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.verified = true
  )
);

-- Add admin column to profiles table
ALTER TABLE public.profiles
ADD COLUMN is_admin BOOLEAN DEFAULT false;