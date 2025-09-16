
"use client";

import { useEffect, useState, useTransition } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getContactMessages, updateMessageStatus } from '@/app/actions';
import type { ContactSubmission, ContactMessageStatus } from '@/types';
import { Loader, ArrowLeft, ShieldAlert, Eye, Archive, Inbox, MailCheck, Home, Reply, Mail, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from '@/components/ui/input';


type StatusFilter = ContactMessageStatus | 'all';
const PRIMARY_ADMIN_EMAIL = process.env.NEXT_PUBLIC_PRIMARY_ADMIN_EMAIL;

export default function AdminMessagesPage() {
    const { user, loading: authLoading } = useAuth();
    const [messages, setMessages] = useState<ContactSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<StatusFilter>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();


    const fetchMessages = async () => {
        setLoading(true);
        try {
            const result = await getContactMessages();
            if (result.data) {
                setMessages(result.data);
            } else {
                setError(result.error || "An unknown error occurred.");
            }
        } catch (e) {
            setError("Failed to fetch messages.");
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
        fetchMessages();
    }, [user, authLoading]);

    const handleUpdateStatus = async (messageId: string, status: ContactMessageStatus) => {
        startTransition(async () => {
            if (!user) return;
            try {
                const idToken = await user.getIdToken();
                const result = await updateMessageStatus(messageId, status, idToken);
                if (result.success && result.updatedMessage) {
                    setMessages(currentMessages => 
                        currentMessages.map(m => m.id === messageId ? result.updatedMessage! : m)
                    );
                    toast({
                        title: 'Status Updated',
                        description: `Message marked as ${status}.`,
                    });
                } else {
                    toast({
                        title: 'Error',
                        description: result.error || 'Failed to update status.',
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
    
    const statusBadges: Record<ContactMessageStatus, {text: string, className: string, icon: React.ReactNode}> = {
        new: { text: "New", className: "bg-blue-500 hover:bg-blue-600", icon: <Inbox className="mr-1 h-3 w-3" /> },
        read: { text: "Read", className: "bg-gray-500 hover:bg-gray-600", icon: <MailCheck className="mr-1 h-3 w-3" /> },
        closed: { text: "Closed", className: "bg-green-600 hover:bg-green-700", icon: <Archive className="mr-1 h-3 w-3" /> },
    };

    const filteredMessages = messages.filter(msg => {
        const matchesTab = activeTab === 'all' || msg.status === activeTab;
        if (!matchesTab) return false;

        if (searchTerm.trim() === '') return true;

        const lowercasedTerm = searchTerm.toLowerCase();
        return msg.name.toLowerCase().includes(lowercasedTerm) ||
               msg.email.toLowerCase().includes(lowercasedTerm) ||
               msg.subject.toLowerCase().includes(lowercasedTerm);
    });

    if (authLoading || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading Messages...</p>
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
                        Contact Form Messages
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground text-left sm:text-center">
                        Here are the messages submitted through the contact form.
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

                <div className="mb-4">
                    <Input 
                        placeholder="Search by name, email, or subject..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as StatusFilter)} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="all">All ({filteredMessages.length})</TabsTrigger>
                      <TabsTrigger value="new">New ({messages.filter(m => m.status === 'new').length})</TabsTrigger>
                      <TabsTrigger value="read">Read ({messages.filter(m => m.status === 'read').length})</TabsTrigger>
                      <TabsTrigger value="closed">Closed ({messages.filter(m => m.status === 'closed').length})</TabsTrigger>
                  </TabsList>

                  <div className="w-full space-y-4 mt-6">
                      {error && <p className="text-destructive text-center">{error}</p>}
                      
                      {filteredMessages.length === 0 && !error ? (
                        <p className="text-center text-muted-foreground py-10">
                          {searchTerm ? `No messages found for "${searchTerm}".` : "No messages in this category."}
                        </p>
                      ) : (
                          filteredMessages.map((msg) => (
                             <Collapsible key={msg.id} className={cn("border rounded-lg shadow-sm transition-colors", {
                                "border-blue-500/50 bg-blue-500/5": msg.status === 'new',
                                "border-border": msg.status !== 'new',
                              })}>
                                <CollapsibleTrigger asChild>
                                  <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-accent/50">
                                      <div className="flex-1">
                                          <div className="flex items-center gap-3">
                                            <Badge variant="secondary" className={cn(statusBadges[msg.status].className, 'text-white')}>
                                              {statusBadges[msg.status].icon}
                                              {statusBadges[msg.status].text}
                                            </Badge>
                                            <span className="font-semibold">{msg.name}</span>
                                          </div>
                                          <p className="text-sm font-medium text-foreground mt-1 truncate">{msg.subject}</p>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {format(new Date(msg.timestamp), 'PPp')}
                                          </p>
                                      </div>
                                      <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]:rotate-180" />
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="p-4 border-t">
                                      <p className="text-sm text-muted-foreground">From: <a href={`mailto:${msg.email}`} className="text-primary hover:underline">{msg.email}</a></p>
                                      <p className="text-foreground whitespace-pre-wrap mt-4">{msg.message}</p>
                                      <div className="flex justify-end gap-2 mt-6">
                                          <Button asChild size="sm" variant="outline">
                                            <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}>
                                              <Mail className="mr-2 h-4 w-4" /> Reply
                                            </a>
                                          </Button>
                                          {msg.status !== 'read' && (
                                              <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleUpdateStatus(msg.id, 'read')}>
                                                  <Eye className="mr-2 h-4 w-4" /> Mark as Read
                                              </Button>
                                          )}
                                           {msg.status !== 'new' && (
                                              <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleUpdateStatus(msg.id, 'new')}>
                                                  <Inbox className="mr-2 h-4 w-4" /> Mark as New
                                              </Button>
                                          )}
                                          {msg.status !== 'closed' && (
                                              <Button size="sm" variant="secondary" disabled={isPending} onClick={() => handleUpdateStatus(msg.id, 'closed')}>
                                                  <Archive className="mr-2 h-4 w-4" /> Close Request
                                              </Button>
                                          )}
                                      </div>
                                </CollapsibleContent>
                             </Collapsible>
                          ))
                      )}
                  </div>
                </Tabs>
            </div>
        </main>
    );
}
