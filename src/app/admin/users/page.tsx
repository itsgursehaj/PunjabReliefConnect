
"use client";

import { useEffect, useState, useTransition } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getAllUsers, setUserRole } from '@/app/actions';
import type { AppUser } from '@/types';
import { Loader, ArrowLeft, ShieldAlert, ShieldCheck, Shield, UserCog, Home, UserX, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

const PRIMARY_ADMIN_EMAIL = process.env.NEXT_PUBLIC_PRIMARY_ADMIN_EMAIL;

export default function AdminUsersPage() {
    const { user, loading: authLoading } = useAuth();
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const fetchUsers = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const idToken = await user.getIdToken();
            const result = await getAllUsers(idToken);
            if (result.users) {
                setUsers(result.users);
            } else {
                setError(result.error || "An unknown error occurred.");
            }
        } catch (e) {
            setError("Failed to fetch users.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (authLoading) return;
        if (!user || user.email !== PRIMARY_ADMIN_EMAIL) {
            setLoading(false);
            return;
        }
        fetchUsers();
    }, [user, authLoading]);

    const handleSetRole = (uid: string, role: 'admin' | 'user' | 'blocked') => {
        startTransition(async () => {
            if (!user) return;
            try {
                const idToken = await user.getIdToken();
                const result = await setUserRole(uid, role, idToken);
                if (result.success) {
                    toast({
                        title: 'Success',
                        description: `User has been ${role === 'blocked' ? 'blocked' : 'updated'}.`,
                    });
                    fetchUsers(); // Re-fetch users to show updated roles
                } else {
                    toast({
                        title: 'Error',
                        description: result.error || 'Failed to update role.',
                        variant: 'destructive',
                    });
                }
            } catch (e) {
                 toast({
                    title: 'Error',
                    description: 'An unexpected error occurred.',
                    variant: 'destructive',
                });
            }
        });
    };
    
    const roleBadges: Record<AppUser['role'], {text: string, className: string, icon: React.ReactNode}> = {
        admin: { text: "Admin", className: "bg-green-600 hover:bg-green-700", icon: <ShieldCheck className="mr-1 h-3 w-3" /> },
        user: { text: "User", className: "bg-secondary text-secondary-foreground hover:bg-secondary/80", icon: <UserIcon className="mr-1 h-3 w-3" /> },
        blocked: { text: "Blocked", className: "bg-destructive text-destructive-foreground hover:bg-destructive/80", icon: <UserX className="mr-1 h-3 w-3" /> },
    }

    if (authLoading || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading Users...</p>
            </div>
        );
    }
    
    if (!user || user.email !== PRIMARY_ADMIN_EMAIL) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-soft px-4 text-center">
              <div className="w-full max-w-md">
                  <div className="max-w-md w-full bg-card p-8 rounded-2xl shadow-xl border mt-4">
                      <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
                      <h1 className="text-3xl font-bold font-headline text-foreground mb-2">
                          Access Denied
                      </h1>
                      <p className="text-muted-foreground mb-8">
                          You do not have permission to view this page. This area is for administrators only.
                      </p>
                      <Button asChild>
                        <Link href="/dashboard">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to Dashboard
                        </Link>
                      </Button>
                  </div>
              </div>
          </div>
      );
    }

    return (
        <main className="flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-5xl">
                 <div className="text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-2 font-headline tracking-tight bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
                        User Management
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground text-left sm:text-center">
                        View all registered users and manage their roles.
                    </p>
                 </div>
                <div className="w-full flex justify-between items-center py-8">
                   <div className="flex items-center gap-4">
                     <Button variant="outline" onClick={() => router.back()}>
                       <ArrowLeft className="mr-2 h-4 w-4" />
                       Back
                     </Button>
                      <Button asChild variant="outline">
                       <Link href="/">
                         <Home className="mr-2 h-4 w-4" />
                         Home
                       </Link>
                     </Button>
                   </div>
                    <Button asChild variant="outline">
                      <Link href="/dashboard">
                        Back to Dashboard
                      </Link>
                    </Button>
                 </div>

                <div className="w-full bg-card border rounded-lg shadow-sm">
                    {error && <p className="text-destructive text-center p-4">{error}</p>}
                    
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Joined On</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((appUser) => (
                                <TableRow key={appUser.uid}>
                                    <TableCell className="font-medium">{appUser.displayName}</TableCell>
                                    <TableCell>{appUser.email}</TableCell>
                                    <TableCell>{format(new Date(appUser.creationTime), 'PP')}</TableCell>
                                    <TableCell>
                                        <Badge variant={appUser.role === 'user' ? 'secondary' : 'default'} className={cn(roleBadges[appUser.role]?.className, "text-white")}>
                                            {roleBadges[appUser.role]?.icon}
                                            {roleBadges[appUser.role]?.text}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {appUser.email !== PRIMARY_ADMIN_EMAIL ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" disabled={isPending}>
                                                        <UserCog className="mr-2 h-4 w-4" />
                                                        Manage
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {appUser.role !== 'admin' && (
                                                        <DropdownMenuItem onClick={() => handleSetRole(appUser.uid, 'admin')}>
                                                            <ShieldCheck className="mr-2 h-4 w-4 text-green-600" />
                                                            <span>Promote to Admin</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {appUser.role === 'admin' && (
                                                        <DropdownMenuItem onClick={() => handleSetRole(appUser.uid, 'user')}>
                                                            <UserIcon className="mr-2 h-4 w-4" />
                                                            <span>Demote to User</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    {appUser.role !== 'blocked' ? (
                                                      <DropdownMenuItem onClick={() => handleSetRole(appUser.uid, 'blocked')} className="text-destructive">
                                                          <UserX className="mr-2 h-4 w-4" />
                                                          <span>Block User</span>
                                                      </DropdownMenuItem>
                                                    ) : (
                                                      <DropdownMenuItem onClick={() => handleSetRole(appUser.uid, 'user')}>
                                                          <UserIcon className="mr-2 h-4 w-4 text-green-600" />
                                                          <span>Unblock User</span>
                                                      </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : (
                                          <span className="text-xs text-muted-foreground">Primary Admin</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </main>
    );
}
