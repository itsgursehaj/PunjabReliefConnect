
"use client";

import { useEffect, useState, useTransition } from "react";
import DashboardClient from "@/components/dashboard-client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { ArrowLeft, Loader, Mail, Home, Users, AlertCircle, Eye, EyeOff, LogIn, History, UserX, ChevronDown, ShieldCheck, LogOut } from "lucide-react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { getContactMessages, logLogin } from "@/app/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AuthError } from "firebase/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import AuthNav from "@/components/auth-nav";


export default function DashboardPage() {
  const { 
    user, 
    loading, 
    isAuthAvailable,
    signInWithGoogle, 
    signOut,
    signUpWithEmailAndPassword,
    signInWithEmailPassword,
    sendVerificationEmail,
    sendPasswordReset,
  } = useAuth();

  const router = useRouter();
  const { toast } = useToast();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);
  const [isAuthPending, setAuthPending] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  useEffect(() => {
    if (user && user.claims?.blocked) {
      setIsBlocked(true);
    } else {
      setIsBlocked(false);
    }
  }, [user]);

   const handleAuthError = (error: AuthError) => {
     setAuthSuccessMessage(null);
     switch (error.code) {
        case 'auth/popup-closed-by-user':
          return "Sign-in process was cancelled. Please try again.";
        case 'auth/cancelled-popup-request':
          return "Sign-in process was cancelled. Please try again.";
        case 'auth/popup-blocked-by-browser':
          return "Sign-in popup was blocked by your browser. Please allow popups for this site.";
        case 'auth/user-not-found':
          return "No account found with this email. Please sign up or check your email for typos.";
        case 'auth/wrong-password':
          return "Incorrect password. Please try again.";
        case 'auth/invalid-credential':
          return "Incorrect email or password. Please try again.";
        case 'auth/email-already-in-use':
          return "An account already exists with this email address.";
        case 'auth/weak-password':
            return "The password is too weak. It must be at least 6 characters long.";
        case 'auth/invalid-email':
            return "The email address is not valid.";
        default:
          return error.message || "An unknown error occurred.";
      }
   }
   
  const handleSignInWithGoogle = async () => {
    setAuthPending(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
      const idToken = await auth.currentUser?.getIdToken();
      if (idToken) {
          await logLogin(idToken);
      }
    } catch (error: any) {
      setAuthError(handleAuthError(error));
    } finally {
      setAuthPending(false);
    }
  };

  const handleEmailPasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthPending(true);
    setAuthError(null);
    setAuthSuccessMessage(null);
    try {
        await signUpWithEmailAndPassword(email, password, displayName);
        setAuthSuccessMessage("Account created successfully! Please check your email to verify your account before signing in.");
        setAuthMode('signin');
    } catch (error: any) {
        setAuthError(handleAuthError(error));
    } finally {
        setAuthPending(false);
    }
  };
  
  const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthPending(true);
    setAuthError(null);
    setAuthSuccessMessage(null);
    try {
        await signInWithEmailPassword(email, password);
        const idToken = await auth.currentUser?.getIdToken();
        if (idToken) {
            await logLogin(idToken);
        }
    } catch (error: any) {
        setAuthError(handleAuthError(error));
    } finally {
        setAuthPending(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendVerificationEmail();
      setAuthSuccessMessage("A new verification email has been sent. Please check your inbox (and spam folder).");
    } catch (error: any) {
      setAuthError("Failed to send verification email. Please try again in a few minutes.");
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setAuthError("Please enter your email address to reset your password.");
      return;
    }
    setAuthPending(true);
    setAuthError(null);
    try {
      await sendPasswordReset(email);
      setAuthSuccessMessage("Password reset link sent! Please check your email.");
      toast({
        title: "Password Reset Email Sent",
        description: `A password reset link has been sent to ${email}.`,
      });
    } catch (error: any) {
      setAuthError(handleAuthError(error));
    } finally {
      setAuthPending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading... / ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...</p>
      </div>
    );
  }

  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-gradient-soft px-4 text-center">
            <div className="w-full max-w-md">
                <Card className="shadow-xl border">
                  <CardHeader>
                    <CardTitle className="text-2xl font-headline flex items-center justify-center gap-2">
                       <LogIn className="h-6 w-6" />
                      Log in or Sign up
                    </CardTitle>
                     <CardDescription>
                      Access the dashboard to view and join relief efforts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     {authSuccessMessage && <Alert variant="default" className="border-green-500 text-green-700"><AlertCircle className="h-4 w-4 !text-green-700" /><AlertDescription>{authSuccessMessage}</AlertDescription></Alert>}
                     {authError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{authError}</AlertDescription></Alert>}

                     <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'signin' | 'signup')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="signin">Sign In</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>
                        <TabsContent value="signin" className="pt-4">
                            <form onSubmit={handleEmailPasswordSignIn} className="space-y-4" autoComplete="off">
                                <div className="space-y-1">
                                    <Label htmlFor="email-signin">Email</Label>
                                    <Input id="email-signin" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off" />
                                </div>
                                <div className="space-y-1 relative">
                                    <Label htmlFor="password-signin">Password</Label>
                                    <Input id="password-signin" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password"/>
                                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 bottom-1 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                    </Button>
                                </div>
                                <Button type="submit" disabled={isAuthPending} className="w-full">
                                    {isAuthPending ? <Loader className="animate-spin mr-2" /> : null}
                                    Sign In
                                </Button>
                                <div className="text-center">
                                  <Button type="button" variant="link" size="sm" onClick={handleForgotPassword} disabled={isAuthPending}>
                                    Forgot Password?
                                  </Button>
                                </div>
                            </form>
                        </TabsContent>
                        <TabsContent value="signup" className="pt-4">
                            <form onSubmit={handleEmailPasswordSignUp} className="space-y-4" autoComplete="off">
                                <div className="space-y-1">
                                    <Label htmlFor="name-signup">Full Name</Label>
                                    <Input id="name-signup" type="text" placeholder="Your Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required autoComplete="off"/>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="email-signup">Email</Label>
                                    <Input id="email-signup" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off" />
                                </div>
                                <div className="space-y-1 relative">
                                    <Label htmlFor="password-signup">Password</Label>
                                    <Input id="password-signup" type={showPassword ? 'text' : 'password'} placeholder="Choose a password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password"/>
                                     <Button type="button" variant="ghost" size="icon" className="absolute right-1 bottom-1 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                    </Button>
                                </div>
                                <Button type="submit" disabled={isAuthPending} className="w-full">
                                     {isAuthPending ? <Loader className="animate-spin mr-2" /> : null}
                                    Sign Up
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                    <Separator className="my-4" />
                     <Button onClick={handleSignInWithGoogle} size="lg" variant="outline" className="w-full text-lg" disabled={isAuthPending}>
                        {isAuthPending ? <Loader className="animate-spin mr-2" /> : <FcGoogle className="mr-3 h-6 w-6" />}
                        Continue with Google
                    </Button>
                  </CardContent>
                  <CardFooter className="flex-col space-y-4 pt-6">
                     <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/">
                          <Home className="mr-2 h-4 w-4" />
                          Home / ਮੁੱਖ ਪੰਨਾ
                        </Link>
                      </Button>
                      {!isAuthAvailable && (
                        <p className="mt-4 text-xs text-destructive">
                          Firebase configuration is missing. Please check your environment variables.
                        </p>
                      )}
                  </CardFooter>
                </Card>
            </div>
        </div>
    );
  }

  // If user is logged in, but email is not verified
  if (!user.emailVerified) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-gradient-soft px-4 text-center">
            <div className="w-full max-w-lg">
                <Card className="shadow-xl border">
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline">Verify Your Email</CardTitle>
                        <CardDescription>A verification link has been sent to <strong>{user.email}</strong>. Please check your inbox (and spam folder) to continue.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         {authSuccessMessage && <Alert variant="default" className="border-green-500 text-green-700"><AlertCircle className="h-4 w-4 !text-green-700" /><AlertDescription>{authSuccessMessage}</AlertDescription></Alert>}
                         {authError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{authError}</AlertDescription></Alert>}
                        <p className="text-sm text-muted-foreground">
                            Didn't receive the email?
                        </p>
                        <Button onClick={handleResendVerification} disabled={isAuthPending}>
                           {isAuthPending ? <Loader className="animate-spin mr-2" /> : null}
                            Resend Verification Link
                        </Button>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={signOut} variant="outline" size="sm">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
  }

  if (isBlocked) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-gradient-soft px-4 text-center">
            <div className="w-full max-w-lg">
                <Card className="shadow-xl border">
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline flex items-center justify-center gap-2">
                           <UserX className="h-8 w-8 text-destructive"/>
                            Account Blocked
                        </CardTitle>
                        <CardDescription>Your account has been blocked due to suspicious activity. Please contact the site administrator for more information.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button onClick={signOut} variant="outline" size="sm">
                             <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
  }

  return (
    <main className="flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl">
        <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-2 font-headline tracking-tight bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
              <span>Volunteer Dashboard</span>
              <span className="block text-3xl sm:text-4xl text-muted-foreground mt-1">ਵਲੰਟੀਅਰ ਡੈਸ਼ਬੋਰਡ</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground text-left sm:text-center">
              <span>View affected villages and their needs on the map.</span>
              <span className="block text-muted-foreground">ਨਕਸ਼ੇ 'ਤੇ ਪ੍ਰਭਾਵਿਤ ਪਿੰਡਾਂ ਅਤੇ ਉਨ੍ਹਾਂ ਦੀਆਂ ਲੋੜਾਂ ਨੂੰ ਦੇਖੋ।</span>
            </p>
        </div>
        
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 py-8">
            <div className="flex items-center gap-4">
               <Button variant="outline" onClick={() => router.back()}>
                 <ArrowLeft className="mr-2 h-4 w-4" />
                 Back / ਪਿੱਛੇ
               </Button>
                <Button asChild variant="outline">
                 <Link href="/">
                   <Home className="mr-2 h-4 w-4" />
                   Home / ਮੁੱਖ ਪੰਨਾ
                 </Link>
               </Button>
            </div>
            <AuthNav />
        </div>

        <DashboardClient user={user} />
      </div>
    </main>
  );
}

    
