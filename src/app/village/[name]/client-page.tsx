
"use client";

import { useState, useEffect, useRef, useMemo, useTransition } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { Village, Volunteer, VillageStatus } from "@/types";
import { Button } from "@/components/ui/button";
import VillageCommentsReports from "@/components/village-comments-reports";
import { AlertCircle, ArrowLeft, Home, Loader, MapPin, Phone, Trash2, UserCheck, UserX, CheckSquare, CheckCircle, Timer, Users, Contact, ShieldX, Bell, Archive, ArchiveRestore } from "lucide-react";
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import VillageMap from "@/components/village-map";
import { useRouter } from "next/navigation";
import { incrementViewCount, joinRequest, unassignRequest, deleteVillageRequestsByName, logCallClick, logMapClick, voteToCloseRequest, updateRequestStatus } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const CALL_CLICK_LIMIT = 3;
const CALL_CLICK_TIMEFRAME = 60 * 1000; // 1 minute in milliseconds
const COOLDOWN_PERIOD = 60 * 1000; // 1 minute
const PRIMARY_ADMIN_EMAIL = process.env.NEXT_PUBLIC_PRIMARY_ADMIN_EMAIL;


interface CallLog {
  timestamp: number;
  contactNumber: string;
}

export default function VillageDetailClient({ villages: initialVillages }: { villages: Village[] }) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const {toast} = useToast();
    const [villages, setVillages] = useState(initialVillages);
    const [isPending, startTransition] = useTransition();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [villageToDelete, setVillageToDelete] = useState<Village | null>(null);

    const [isDeleteAllPending, startDeleteAllTransition] = useTransition();
    
    const [callCooldown, setCallCooldown] = useState(0);

    const isAdmin = user?.email === PRIMARY_ADMIN_EMAIL || user?.claims?.admin;

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (callCooldown > 0) {
            timer = setInterval(() => {
                setCallCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [callCooldown]);

    const effectRan = useRef<{[key: string]: boolean}>({});
    
    // This aggregates data from all requests for the village
    const aggregateData = useMemo(() => {
        if (!villages || villages.length === 0) {
            return {
                villageName: 'N/A',
                district: 'N/A',
                pincode: 'N/A',
                lat: null,
                lng: null,
                combinedNeeds: '',
                allComments: [],
                allReports: [],
                allVolunteers: new Map<string, Volunteer>(),
                allContacts: [],
                mostRecentTimestamp: new Date(0).toISOString(),
                status: 'open' as VillageStatus,
                totalCloseVotes: 0,
            };
        }

        const firstVillage = villages[0];
        const allNeeds = new Set<string>();
        const allComments: any[] = [];
        const allReports: any[] = [];
        const allVolunteers = new Map<string, Volunteer>();
        const allContacts: any[] = [];
        const closeVoteUsers = new Set<string>();

        villages.forEach(v => {
            v.needs.split(',').map(n => n.trim()).forEach(need => allNeeds.add(need));
            if (v.comments) allComments.push(...v.comments.map(c => ({...c, villageId: v.id})));
            if (v.reports) allReports.push(...v.reports.map(r => ({...r, villageId: v.id})));
            if (v.assignedTo) {
              v.assignedTo.forEach(volunteer => {
                if (!allVolunteers.has(volunteer.email)) {
                  allVolunteers.set(volunteer.email, {...volunteer, villageId: v.id});
                }
              });
            }
            if(v.closeVotes) {
                v.closeVotes.forEach(vote => closeVoteUsers.add(vote.userId));
            }
            allContacts.push({
              id: v.id,
              name: v.name,
              contactNumber: v.contactNumber,
              timestamp: v.timestamp
            });
        });

        allComments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        allReports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        allContacts.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const mostRecentTimestamp = allContacts[0]?.timestamp || new Date(0).toISOString();
        
        return {
            villageName: firstVillage.villageName,
            district: firstVillage.district,
            pincode: firstVillage.pincode,
            lat: firstVillage.lat,
            lng: firstVillage.lng,
            combinedNeeds: Array.from(allNeeds).join(', '),
            allComments,
            allReports,
            allVolunteers,
            allContacts,
            mostRecentTimestamp,
            status: firstVillage.status || 'open',
            totalCloseVotes: closeVoteUsers.size,
        }

    }, [villages]);

    useEffect(() => {
        if (!user || !villages || villages.length === 0) return;
        const firstVillageId = villages[0]?.id;
        if (!firstVillageId || (process.env.NODE_ENV === "development" && effectRan.current[firstVillageId])) {
            return;
        }

        const doIncrement = async () => {
            const viewedVillagesKey = 'viewedVillages';
            try {
                const viewedVillages: string[] = JSON.parse(localStorage.getItem(viewedVillagesKey) || '[]');
                
                if (!viewedVillages.includes(aggregateData.villageName)) {
                    const idToken = await user.getIdToken();
                    // Increment each request's view count on the server and log the event
                    await Promise.all(villages.map(v => incrementViewCount(v.id, idToken)));

                    viewedVillages.push(aggregateData.villageName);
                    localStorage.setItem(viewedVillagesKey, JSON.stringify(viewedVillages));
                    
                    setVillages(current => current.map(v => ({ ...v, views: (v.views || 0) + 1 })));
                }
            } catch (error) {
                console.error("Could not update view count:", error);
            }
        };

        doIncrement();

        if (process.env.NODE_ENV === "development") {
            effectRan.current[firstVillageId] = true;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [villages[0]?.id, aggregateData.villageName, user]);


    const handleUpdate = (updatedVillage: Village) => {
        setVillages(currentVillages => 
            currentVillages.map(v => v.id === updatedVillage.id ? updatedVillage : v)
        );
    };

    const handleDeleteClick = (village: Village) => {
        setVillageToDelete(village);
        setDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (villageToDelete) {
            setVillages(current => current.filter(v => v.id !== villageToDelete.id));
        }
        setDialogOpen(false);
        setVillageToDelete(null);
    };

    const handleDeleteAll = () => {
        if (!user || !aggregateData.villageName) return;
        startDeleteAllTransition(async () => {
            try {
                const idToken = await user.getIdToken();
                const result = await deleteVillageRequestsByName(aggregateData.villageName, idToken);
                if (result.success) {
                    toast({ title: "Success", description: `All requests for ${aggregateData.villageName} have been deleted.` });
                    setVillages([]); // Clear the villages to trigger the "deleted" message
                } else {
                    toast({ title: "Error", description: result.error || 'Failed to delete requests.', variant: 'destructive' });
                }
            } catch(e) {
                toast({ title: "Error", description: 'An unexpected error occurred.', variant: 'destructive' });
            }
        });
    }

    const handleJoinRequest = () => {
        const oldestRequest = villages.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
        if (!user || !oldestRequest) return;

        startTransition(async () => {
            try {
                const idToken = await user.getIdToken();
                const result = await joinRequest(oldestRequest.id, idToken);
                if (result.success && result.updatedVillage) {
                toast({ title: "Joined!", description: "You are now listed as a volunteer for this request." });
                handleUpdate(result.updatedVillage);
                } else {
                toast({ title: "Error", description: result.error || "Failed to join request.", variant: "destructive" });
                }
            } catch (e) {
                toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
            }
        });
    };

    const handleUnassign = () => {
        if (!user) return;
        const assignedRequest = villages.find(v => v.assignedTo?.some(volunteer => volunteer.email === user.email));
        if (!assignedRequest) return;

        startTransition(async () => {
        try {
            const idToken = await user.getIdToken();
            const result = await unassignRequest(assignedRequest.id, idToken);
            if (result.success && result.updatedVillage) {
            toast({ title: "Unassigned", description: "You have been removed from this request." });
            handleUpdate(result.updatedVillage);
            } else {
            toast({ title: "Error", description: result.error || "Failed to unassign request.", variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
        }
        });
    };

    const handleCallClick = async (villageId: string, contactNumber: string) => {
        if (!user || callCooldown > 0) return;

        const now = Date.now();
        const callLogKey = 'callClickLog';
        const callLog: CallLog[] = JSON.parse(sessionStorage.getItem(callLogKey) || '[]');
        
        const recentUniqueNumbers = new Set(
            callLog
                .filter(log => now - log.timestamp < CALL_CLICK_TIMEFRAME)
                .map(log => log.contactNumber)
        );

        recentUniqueNumbers.add(contactNumber);

        if (recentUniqueNumbers.size > CALL_CLICK_LIMIT) {
             toast({
                title: "Cooldown Activated",
                description: `You have called too many different numbers in a short period. Please wait ${COOLDOWN_PERIOD / 1000} seconds.`,
                variant: "destructive"
            });
            setCallCooldown(COOLDOWN_PERIOD / 1000);
            return;
        }

        const newLogEntry = { timestamp: now, contactNumber };
        const updatedLog = [...callLog.filter(log => now - log.timestamp < CALL_CLICK_TIMEFRAME), newLogEntry];
        sessionStorage.setItem(callLogKey, JSON.stringify(updatedLog));

        try {
            const idToken = await user.getIdToken();
            await logCallClick(villageId, idToken);
            router.push(`tel:${contactNumber}`);
        } catch (e) {
            console.error("Failed to log call click", e);
            router.push(`tel:${contactNumber}`);
        }
    };

    const handleMapClick = async (villageId: string, lat: number | null, lng: number | null) => {
        if (!user || !lat || !lng) return;
        try {
            const idToken = await user.getIdToken();
            await logMapClick(villageId, idToken);
            window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank', 'noopener,noreferrer');
        } catch (e) {
            console.error("Failed to log map click", e);
            window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank', 'noopener,noreferrer');
        }
    };

    const handleVoteToClose = () => {
        if (!user) return;
        const requestToVoteOn = villages[0]; // Vote on the first request for simplicity
        startTransition(async () => {
            try {
                const idToken = await user.getIdToken();
                const result = await voteToCloseRequest(requestToVoteOn.id, idToken);
                if (result.success && result.updatedVillage) {
                    toast({ title: "Voted!", description: "Your vote to close this request has been recorded." });
                    handleUpdate(result.updatedVillage);
                } else {
                    toast({ title: "Error", description: result.error, variant: "destructive" });
                }
            } catch(e) {
                toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
            }
        });
    }

    const handleUpdateStatus = (newStatus: VillageStatus) => {
        if (!isAdmin) return;
        startTransition(async () => {
            try {
                const idToken = await user.getIdToken();
                const result = await updateRequestStatus(aggregateData.villageName, newStatus, idToken);
                 if (result.success) {
                    toast({ title: `Request ${newStatus}`, description: `All requests for ${aggregateData.villageName} have been ${newStatus}.` });
                    setVillages(current => current.map(v => ({ ...v, status: newStatus })));
                } else {
                    toast({ title: "Error", description: result.error, variant: "destructive" });
                }
            } catch(e) {
                 toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
            }
        });
    };

    if (authLoading) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading Request... / ਬੇਨਤੀ ਲੋਡ ਹੋ ਰਹੀ ਹੈ...</p>
            </div>
        )
    }
    
    if (!user) {
        router.push('/dashboard');
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Redirecting to login... / ਲੌਗਇਨ 'ਤੇ ਵਾਪਸ ਜਾ ਰਿਹਾ ਹੈ...</p>
            </div>
        );
    }
    
    if (villages.length === 0) {
      return (
        <main className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-lg p-4 text-center">
                 <Card>
                    <CardHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <CardTitle className="mt-4">Requests Deleted</CardTitle>
                        <CardDescription>
                            All requests for this village have been successfully removed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mt-6 flex justify-center gap-4">
                            <Button asChild variant="outline">
                                <Link href="/dashboard">
                                <ArrowLeft className="mr-2 h-4 w-4"/>
                                Back to Dashboard
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                Home
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
      )
    }

    const { villageName, district, pincode, combinedNeeds, allComments, allReports, allVolunteers, allContacts, lat, lng, mostRecentTimestamp, status, totalCloseVotes } = aggregateData;
    const isCurrentUserWorking = user?.email ? Array.from(allVolunteers.values()).some(v => v.email === user.email) : false;
    const hasVotedToClose = user?.email ? villages.some(v => v.closeVotes?.some(vote => vote.userId === user.email)) : false;

    return (
        <main className="flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl">
                 <div className="text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-2 font-headline tracking-tight bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
                      <span>Relief Request Details</span>
                      <span className="block text-3xl sm:text-4xl text-muted-foreground mt-1">ਰਾਹਤ ਬੇਨਤੀ ਦੇ ਵੇਰਵੇ</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground">
                        {villageName}, {district}
                    </p>
                 </div>
                <div className="w-full flex justify-between items-center py-8">
                   <div className="flex items-center gap-4">
                     <Button asChild variant="outline">
                       <Link href="/dashboard">
                         <ArrowLeft className="mr-2 h-4 w-4" />
                         Back to Dashboard / ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਵਾਪਸ
                       </Link>
                     </Button>
                   </div>
                 </div>

                 {status === 'closed' && (
                    <Alert variant="destructive" className="mb-6 bg-amber-50 border-amber-300 text-amber-800">
                        <Archive className="h-4 w-4 !text-amber-800" />
                        <AlertTitle>This request is closed</AlertTitle>
                        <AlertDescription>
                            This relief request has been marked as closed and is no longer active.
                        </AlertDescription>
                    </Alert>
                )}


                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-2 space-y-6">
                         <Card className="shadow-lg">
                             <CardHeader>
                                <CardTitle className="flex justify-between items-start">
                                    <span className="flex items-center gap-2">
                                        <MapPin className="h-6 w-6"/>
                                        {villageName}
                                    </span>
                                    {isAdmin && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="destructive" disabled={isDeleteAllPending}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete All
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete all {villages.length} requests for {villageName}. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive hover:bg-destructive/90" disabled={isDeleteAllPending}>
                                                        {isDeleteAllPending ? "Deleting..." : "Yes, delete all"}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    First reported on {format(new Date(mostRecentTimestamp), "PPp")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div><strong>District / ਜ਼ਿਲ੍ਹਾ:</strong> {district}</div>
                                    <div><strong>Pincode / ਪਿੰਨ ਕੋਡ:</strong> {pincode}</div>
                                </div>
                                <div className="pt-2">
                                    <h4 className="font-semibold mb-2">Needs / ਲੋੜਾਂ</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{combinedNeeds}</p>
                                </div>
                                <div className="pt-4">
                                     <Button variant="outline" onClick={() => handleMapClick(villages[0].id, lat, lng)} className="w-full">
                                        <MapPin className="mr-2"/> Open in Maps / ਨਕਸ਼ੇ ਵਿੱਚ ਖੋਲ੍ਹੋ
                                    </Button>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row gap-2 border-t pt-4">
                                {isAdmin ? (
                                    status === 'open' ? (
                                    <Button onClick={() => handleUpdateStatus('closed')} className="w-full bg-amber-600 hover:bg-amber-700" disabled={isPending}>
                                        <Archive className="mr-2"/>
                                        Close All Requests ({totalCloseVotes} Votes)
                                    </Button>
                                    ) : (
                                    <Button onClick={() => handleUpdateStatus('open')} className="w-full bg-green-600 hover:bg-green-700" disabled={isPending}>
                                        <ArchiveRestore className="mr-2"/>
                                        Reopen All Requests
                                    </Button>
                                    )
                                ) : (
                                    <Button onClick={handleVoteToClose} className="w-full" disabled={isPending || hasVotedToClose}>
                                        <ShieldX className="mr-2"/>
                                        {hasVotedToClose ? "You've Voted to Close" : "Request Closure (Resolved)"}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                        
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-start gap-2">
                                  <Contact className="mt-1"/>
                                  <span>
                                      <span>Contact Person</span>
                                      <span className="block text-xl font-normal text-muted-foreground mt-1">ਸੰਪਰਕ ਵਿਅਕਤੀ</span>
                                  </span>
                                </CardTitle>
                                <CardDescription>
                                  <span>All contacts who have submitted requests for this village.</span>
                                  <span className="block text-sm text-muted-foreground/80">ਇਸ ਪਿੰਡ ਲਈ ਬੇਨਤੀਆਂ ਦਰਜ ਕਰਨ ਵਾਲੇ ਸਾਰੇ ਸੰਪਰਕ।</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {allContacts.map(contact => (
                                    <div key={contact.id} className="flex justify-between items-center p-3 border-b last:border-b-0">
                                        <div>
                                            <p className="font-semibold">{contact.name}</p>
                                            <p className="text-sm text-muted-foreground">Request added on {format(new Date(contact.timestamp), "PPp")}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                             <Button size="sm" variant="default" onClick={() => handleCallClick(contact.id, contact.contactNumber)} disabled={callCooldown > 0}>
                                                {callCooldown > 0 ? <Timer className="mr-2"/> : <Phone className="mr-2"/>}
                                                {callCooldown > 0 ? `Wait ${callCooldown}s` : "Call / ਕਾਲ ਕਰੋ"}
                                            </Button>
                                            {isAdmin && (
                                                <Button size="icon" variant="destructive" onClick={() => handleDeleteClick(contact)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                             <CardHeader>
                                <CardTitle className="flex items-start gap-2">
                                    <Users className="mt-1"/>
                                     <span>
                                        <span>Volunteers on this Request</span>
                                        <span className="block text-xl font-normal text-muted-foreground mt-1">ਇਸ ਬੇਨਤੀ 'ਤੇ ਵਲੰਟੀਅਰ</span>
                                    </span>
                                </CardTitle>
                                <CardDescription>
                                     <span>People who are currently working on this request.</span>
                                     <span className="block text-sm text-muted-foreground/80">ਉਹ ਲੋਕ ਜੋ ਇਸ ਬੇਨਤੀ 'ਤੇ ਵਰਤਮਾਨ ਵਿੱਚ ਕੰਮ ਕਰ ਰਹੇ ਹਨ।</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 min-h-[100px]">
                                {allVolunteers.size > 0 ? (
                                    <ul className="space-y-1 list-disc list-inside text-sm">
                                    {Array.from(allVolunteers.values()).map(volunteer => (
                                        <li key={volunteer.email} className="text-muted-foreground">
                                        <span className="font-semibold text-foreground">{volunteer.name}</span>
                                        {volunteer.email === user?.email && " (You)"}
                                        </li>
                                    ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted-foreground text-sm text-center py-2">No one is currently working on this request.</p>
                                )}
                            </CardContent>
                             {user && status === 'open' && (
                                <CardFooter className="border-t pt-4">
                                    {isCurrentUserWorking ? (
                                        <Button size="sm" variant="destructive" onClick={handleUnassign} disabled={isPending} className="w-full">
                                            <UserX className="mr-2 h-4 w-4"/> Leave Relief Effort
                                        </Button>
                                    ) : (
                                        <Button size="sm" variant="default" onClick={handleJoinRequest} disabled={isPending} className="bg-green-600 hover:bg-green-700 w-full">
                                            <CheckSquare className="mr-2 h-4 w-4" /> Join Relief Effort
                                        </Button>
                                    )}
                                </CardFooter>
                            )}
                        </Card>
                        
                        <VillageCommentsReports
                            village={{...aggregateData, id: villages[0].id, needs: aggregateData.combinedNeeds, comments: allComments, reports: allReports, status: status, villageName: villageName, district: district, pincode: pincode }}
                            user={user}
                            onUpdate={(updatedVillage) => {
                                setVillages(current => current.map(v => v.id === updatedVillage.id ? updatedVillage : v));
                            }}
                        />
                    </div>
                    {/* Right Column - Map */}
                    <div className="md:col-span-1 sticky top-8 h-96 md:h-[calc(100vh-5rem)]">
                        {lat && lng ? (
                            <div className="bg-card rounded-xl border shadow-sm p-2 w-full h-full">
                                <VillageMap
                                    villages={villages}
                                    selectedVillage={villages[0]}
                                    onMarkerClick={() => {}}
                                />
                            </div>
                        ) : (
                             <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Location Not Available / ਸਥਾਨ ਉਪਲਬਧ ਨਹੀਂ ਹੈ</AlertTitle>
                                <AlertDescription>
                                    The precise location for this village could not be determined. / ਇਸ ਪਿੰਡ ਲਈ ਸਹੀ ਸਥਾਨ ਨਿਰਧਾਰਤ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਿਆ।
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
            </div>
             <DeleteConfirmationDialog
                isOpen={dialogOpen}
                onOpenChange={setDialogOpen}
                onConfirm={handleConfirmDelete}
                villageName={villageToDelete?.villageName}
                user={user}
                villageId={villageToDelete?.id}
            />
        </main>
    );
}
