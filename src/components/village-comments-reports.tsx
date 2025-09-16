
"use client";

import type { Village, User, Comment } from "@/types";
import { useState, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { AlertTriangle, FileText, MessageSquarePlus, Trash2 } from "lucide-react";
import { addReportToRequest, addCommentToRequest, deleteCommentFromRequest, deleteReportFromRequest } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
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
} from "@/components/ui/alert-dialog"
import { Textarea } from "./ui/textarea";
import { CommentFormSchema } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import type { User as FirebaseAuthUser } from 'firebase/auth';

interface AppUser extends FirebaseAuthUser {
    claims?: { [key: string]: any };
}

interface VillageCommentsReportsProps {
  village: Village;
  user: AppUser | null;
  onUpdate: (village: Village) => void;
}

const PRIMARY_ADMIN_EMAIL = process.env.NEXT_PUBLIC_PRIMARY_ADMIN_EMAIL;

export default function VillageCommentsReports({ village, user, onUpdate }: VillageCommentsReportsProps) {
  const [isPending, startTransition] = useTransition();
  const [reportReason, setReportReason] = useState("");
  const { toast } = useToast();
  const isAdmin = user?.email === PRIMARY_ADMIN_EMAIL || user?.claims?.admin;
  
  const commentForm = useForm<z.infer<typeof CommentFormSchema>>({
    resolver: zodResolver(CommentFormSchema),
    defaultValues: { comment: '' },
  });
  
  const handleReport = () => {
    if (!user || !reportReason.trim()) {
        toast({ title: "Error", description: "Reason cannot be empty.", variant: "destructive" });
        return;
    };
    startTransition(async () => {
        try {
            const idToken = await user.getIdToken();
            const result = await addReportToRequest(village.id, reportReason, idToken);
            if (result.success && result.updatedVillage) {
                toast({ title: "Request Reported", description: "Thank you for your feedback." });
                onUpdate(result.updatedVillage);
                setReportReason("");
            } else {
                 toast({ title: "Error", description: result.error || "Failed to report request.", variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
        }
    });
  };
  
  const handleAddComment = (data: z.infer<typeof CommentFormSchema>) => {
    if (!user) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.append('comment', data.comment);
      try {
        const idToken = await user.getIdToken();
        const result = await addCommentToRequest(village.id, formData, idToken);
        if (result.success && result.updatedVillage) {
          toast({ title: "Comment Added", description: "Your comment has been posted." });
          onUpdate(result.updatedVillage);
          commentForm.reset();
        } else {
          toast({ title: "Error", description: result.error || "Failed to add comment.", variant: "destructive" });
        }
      } catch (e) {
        toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
      }
    });
  };
  
  const handleDeleteComment = (commentId: string, villageId: string) => {
    if (!user || !villageId) return;
    startTransition(async () => {
      try {
        const idToken = await user.getIdToken();
        const result = await deleteCommentFromRequest(villageId, commentId, idToken);
        if (result.success && result.updatedVillage) {
          toast({ title: "Comment Deleted", description: "The comment has been removed." });
          onUpdate(result.updatedVillage);
        } else {
          toast({ title: "Error", description: result.error || "Failed to delete comment.", variant: "destructive" });
        }
      } catch (e) {
        toast({ title: "Error", description: "An unexpected error occurred while deleting comment.", variant: "destructive" });
      }
    });
  }

  const handleDeleteReport = (reportId: string, villageId: string) => {
    if (!user || !villageId) return;
    startTransition(async () => {
      try {
        const idToken = await user.getIdToken();
        const result = await deleteReportFromRequest(villageId, reportId, idToken);
        if (result.success && result.updatedVillage) {
          toast({ title: "Report Deleted", description: "The report has been removed." });
          onUpdate(result.updatedVillage);
        } else {
          toast({ title: "Error", description: result.error || "Failed to delete report.", variant: "destructive" });
        }
      } catch (e) {
        toast({ title: "Error", description: "An unexpected error occurred while deleting the report.", variant: "destructive" });
      }
    });
  };
  
    
  return (
    <div className="mt-4">
      <Tabs defaultValue="comments" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 h-auto sm:h-10">
          <TabsTrigger value="comments" className="text-xs sm:text-sm py-2 sm:py-1.5">
            <FileText className="mr-2 h-4 w-4" /> Comments & Status / ਟਿੱਪਣੀਆਂ ਅਤੇ ਸਥਿਤੀ ({village.comments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-xs sm:text-sm py-2 sm:py-1.5">
            <AlertTriangle className="mr-2 h-4 w-4" /> Reports / ਰਿਪੋਰਟਾਂ ({village.reports?.length || 0})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="comments">
          <Card>
            <CardHeader className="p-4">
               <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-5 w-5"/>Comments</CardTitle>
                <CardDescription className="text-xs">Updates and communication regarding this request.</CardDescription>
            </CardHeader>
             <CardContent className="p-4 pt-0 text-xs space-y-3 max-h-60 overflow-y-auto min-h-[100px]">
               {(!village.comments || village.comments.length === 0) ? (
                  <p className="text-muted-foreground text-center py-2">No comments yet.</p>
               ) : (
                 village.comments.map(comment => (
                    <div key={comment.id} className="group flex justify-between items-start border-l-2 border-border pl-3 text-muted-foreground">
                        <div>
                            <p className="whitespace-pre-wrap text-foreground">"{comment.text}"</p>
                            <p className="mt-1 text-[10px]">
                                &ndash; {comment.authorName} ({format(new Date(comment.timestamp), 'PPp')})
                            </p>
                        </div>
                        {user && (user.email === comment.author || isAdmin) && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                     <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" disabled={isPending}>
                                        <Trash2 className="h-3 w-3 text-destructive"/>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your comment.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteComment(comment.id, (comment as any).villageId)} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                                        Delete Comment
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                 ))
               )}
            </CardContent>
            
            {user && village.status === 'open' && (
              <CardFooter className="p-4 border-t">
                  <Form {...commentForm}>
                    <form onSubmit={commentForm.handleSubmit(handleAddComment)} className="space-y-2 w-full">
                        <FormField
                            control={commentForm.control}
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add a public comment... / ਇੱਕ ਜਨਤਕ ਟਿੱਪਣੀ ਸ਼ਾਮਲ ਕਰੋ..."
                                            className="min-h-[60px] text-xs"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" size="sm" disabled={isPending} className="w-full">
                           <MessageSquarePlus className="mr-2 h-4 w-4" /> Post Comment
                        </Button>
                    </form>
                  </Form>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="reports">
           <Card>
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-5 w-5"/>Reports</CardTitle>
              <CardDescription className="text-xs">False or duplicate requests can be reported here.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs space-y-3 max-h-48 overflow-y-auto min-h-[100px]">
                {(!village.reports || village.reports.length === 0) ? (
                    <p className="text-muted-foreground text-center py-2">No reports filed for this request.</p>
                ) : (
                 village.reports?.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(report => (
                    <div key={report.id} className="group flex justify-between items-start border-b pb-2 last:border-none">
                        <div>
                          <p className="whitespace-pre-wrap font-semibold text-destructive">{report.reason}</p>
                          <p className="text-muted-foreground mt-1 text-[10px]">
                              By {report.reporterName} &bull; {format(new Date(report.timestamp), 'PPp')}
                          </p>
                        </div>
                        {isAdmin && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                     <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" disabled={isPending}>
                                        <Trash2 className="h-3 w-3 text-destructive"/>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this report.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteReport(report.id, (report as any).villageId)} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                                        Delete Report
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                 ))
                )}
            </CardContent>
             {user && village.status === 'open' && (
                <CardFooter className="p-4 border-t">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="w-full">
                                <AlertTriangle className="mr-2 h-4 w-4" /> Report this Request
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Report Request for {village.villageName}</AlertDialogTitle>
                            <AlertDialogDescription>
                                Please provide a reason for reporting this request. This helps us maintain the quality of the platform.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <Textarea 
                                placeholder="e.g., This is a duplicate request, the contact number is invalid, etc."
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                            />
                            <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setReportReason("")}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleReport} disabled={isPending || !reportReason.trim()}>
                                {isPending ? "Submitting..." : "Submit Report"}
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
