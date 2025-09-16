
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getAuditLogs } from '@/app/actions';
import type { AuditLog, AuditLogAction } from '@/types';
import { Loader, ArrowLeft, ShieldAlert, Home, Globe, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { allAuditLogActions } from '@/types';


const SENSITIVE_ACTIONS: AuditLog['action'][] = ['CALL_CONTACT'];
const WARNING_THRESHOLD = 5;
const DANGER_THRESHOLD = 10;
const PRIMARY_ADMIN_EMAIL = process.env.NEXT_PUBLIC_PRIMARY_ADMIN_EMAIL;


export default function AdminAuditLogPage() {
    const { user, loading: authLoading } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState<AuditLogAction | 'all'>('all');
    const router = useRouter();

    const fetchLogs = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const idToken = await user.getIdToken();
            const result = await getAuditLogs(idToken);
            if (result.logs) {
                setLogs(result.logs);
            } else {
                setError(result.error || "An unknown error occurred.");
            }
        } catch (e) {
            setError("Failed to fetch audit logs.");
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
        fetchLogs();
    }, [user, authLoading]);

    const userActionCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        logs.forEach(log => {
            if (SENSITIVE_ACTIONS.includes(log.action)) {
                counts[log.userId] = (counts[log.userId] || 0) + 1;
            }
        });
        return counts;
    }, [logs]);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = !searchTerm ||
                log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesAction = actionFilter === 'all' || log.action === actionFilter;

            return matchesSearch && matchesAction;
        });
    }, [logs, searchTerm, actionFilter]);


    if (authLoading || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading Audit Logs...</p>
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
            <div className="w-full max-w-7xl">
                 <div className="text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-2 font-headline tracking-tight bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
                        Audit Log
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground text-left sm:text-center">
                        A timeline of all significant actions performed by users.
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
                 
                 <Card className="mb-6">
                    <CardHeader className="border-b p-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filter & Search Logs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                         <Input 
                            placeholder="Search logs by user, action, details, IP..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-2/3"
                         />
                         <Select value={actionFilter} onValueChange={(value) => setActionFilter(value as AuditLogAction | 'all')}>
                            <SelectTrigger className="w-full sm:w-1/3">
                                <SelectValue placeholder="Filter by action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                {allAuditLogActions.map(action => (
                                    <SelectItem key={action} value={action}>{action}</SelectItem>
                                ))}
                            </SelectContent>
                         </Select>
                    </CardContent>
                 </Card>
                 
                {filteredLogs.length === 0 && (searchTerm || actionFilter !== 'all') && (
                    <Alert>
                        <ShieldAlert className="h-4 w-4" />
                        <AlertDescription>
                            No logs found matching your search term and filter criteria.
                        </AlertDescription>
                    </Alert>
                )}


                <div className="w-full bg-card border rounded-lg shadow-sm">
                    {error && <p className="text-destructive text-center p-4">{error}</p>}
                    
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead className="text-right">Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {filteredLogs.length === 0 && !error ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                    No audit logs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLogs.map((log) => {
                                    const userSensitiveActionCount = userActionCounts[log.userId] || 0;
                                    const isWarning = userSensitiveActionCount >= WARNING_THRESHOLD && userSensitiveActionCount < DANGER_THRESHOLD;
                                    const isDanger = userSensitiveActionCount >= DANGER_THRESHOLD;
                                    const isOutsideIndia = log.countryCode && log.countryCode !== 'IN' && log.userId !== PRIMARY_ADMIN_EMAIL;

                                    return (
                                    <TableRow key={log.id} className={cn({
                                        'bg-yellow-500/10 hover:bg-yellow-500/20': isWarning && !isDanger,
                                        'bg-red-500/10 hover:bg-red-500/20': isDanger,
                                        'bg-orange-500/10 hover:bg-orange-500/20': isOutsideIndia && !isWarning && !isDanger,
                                    })}>
                                        <TableCell className="font-medium">
                                            <div>{log.userName}</div>
                                            <div className="text-xs text-muted-foreground">{log.userId}</div>
                                             {isOutsideIndia && (
                                                <Badge variant="destructive" className="mt-1 bg-orange-600">
                                                    <Globe className="mr-1 h-3 w-3" />
                                                    Outside India
                                                </Badge>
                                             )}
                                            {(isWarning || isDanger) && (
                                                <Badge variant="destructive" className={cn("mt-1", isWarning && "bg-yellow-500 text-black")}>
                                                    {userSensitiveActionCount} Call Clicks
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-xs bg-muted p-1 rounded">{log.action}</span>
                                        </TableCell>
                                        <TableCell className="text-sm max-w-xs truncate">{log.details}</TableCell>
                                        <TableCell className="text-xs">
                                          {log.countryCode && (
                                            <div className="flex items-center gap-2">
                                                <img 
                                                    src={`https://flagsapi.com/${log.countryCode}/flat/16.png`}
                                                    alt={`${log.country} flag`}
                                                    className="w-4 h-4"
                                                />
                                                <span>{log.city}, {log.country}</span>
                                            </div>
                                          )}
                                           <div className="font-mono text-muted-foreground">{log.ipAddress}</div>
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                                            {format(new Date(log.timestamp), 'PPp')}
                                        </TableCell>
                                    </TableRow>
                                )})
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </main>
    );
}
