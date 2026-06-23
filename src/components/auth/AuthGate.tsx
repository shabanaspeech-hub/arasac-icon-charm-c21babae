import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import spectraLogo from "@/assets/spectra-logo.png";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    setSigningIn(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error.message || "Sign-in failed. Please try again.");
      setSigningIn(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl p-8 text-center border border-border">
          <img src={spectraLogo} alt="Speechy AAC" className="w-20 h-20 mx-auto rounded-full bg-white p-1 shadow-lg mb-4" />
          <h1 className="text-2xl font-extrabold text-foreground">Speechy AAC</h1>
          <p className="text-xs text-muted-foreground mt-1 mb-6">
            by SpectraSpeech — Shabana Tariq, SLP
          </p>
          <p className="text-sm text-foreground/80 mb-6">
            Please sign in with Google to continue.
          </p>
          <Button
            onClick={signIn}
            disabled={signingIn}
            size="lg"
            className="w-full gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.2 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.2 29.1 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 43.5c5 0 9.6-1.7 13.1-4.6l-6.1-5c-2 1.4-4.4 2.1-7 2.1-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.1 16.2 43.5 24 43.5z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.4l6.1 5c-.4.4 6.4-4.7 6.4-14.4 0-1.2-.1-2.3-.4-3.5z"/>
            </svg>
            {signingIn ? "Signing in…" : "Continue with Google"}
          </Button>
          {error && (
            <p className="text-xs text-destructive mt-4">{error}</p>
          )}
          <p className="text-[10px] text-muted-foreground mt-6">
            Your email is stored securely to enable your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={signOut}
        title="Sign out"
        className="fixed top-2 right-2 z-50 flex items-center gap-1 px-2 py-1 rounded-md bg-card/90 border border-border text-xs text-foreground shadow-sm hover:bg-card"
      >
        <LogOut size={12} />
        <span className="hidden sm:inline">Sign out</span>
      </button>
      {children}
    </div>
  );
}
