-- Drop the incorrect policies
DROP POLICY IF EXISTS "Admins can view all verifications" ON public.identity_verification;
DROP POLICY IF EXISTS "Admins can update all verifications" ON public.identity_verification;

-- Create security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
    AND is_admin = true
  )
$$;

-- Create correct admin policies
CREATE POLICY "Admins can view all verifications"
ON public.identity_verification
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all verifications"
ON public.identity_verification
FOR UPDATE
USING (public.is_admin(auth.uid()));