
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteReliefRequest } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { User } from 'firebase/auth';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  villageName?: string;
  villageId?: string;
  user: User | null;
}

export default function DeleteConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  villageName,
  villageId,
  user,
}: DeleteConfirmationDialogProps) {
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!villageId || !user) {
        toast({ title: "Error", description: "Cannot perform delete action. Village or user is missing.", variant: "destructive" });
        return;
    }
    
    try {
        const idToken = await user.getIdToken();
        const result = await deleteReliefRequest(villageId, idToken);

        if (result.success) {
            toast({ title: "Success", description: "Village request deleted." });
            onConfirm();
        } else {
            toast({ title: "Error", description: result.error || "Failed to delete request.", variant: "destructive" });
        }
    } catch (error) {
        toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    }
  };


  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the relief request for{" "}
            <span className="font-semibold">{villageName}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
