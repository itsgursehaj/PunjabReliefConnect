
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getContactMessages } from "@/app/actions";
import Link from "next/link";
import {
  ShieldCheck,
  ChevronDown,
  History,
  Users,
  Mail,
  LogOut,
  LogIn,
  UserPlus
} from "lucide-react";
import { usePathname } from "next/navigation";

const PRIMARY_ADMIN_EMAIL = process.env.NEXT_PUBLIC_PRIMARY_ADMIN_EMAIL;

export default function AuthNav() {
  const { user, signOut } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const pathname = usePathname();

  // A user is an admin if they are the primary admin OR have the admin custom claim.
  const isAdmin = user?.email === PRIMARY_ADMIN_EMAIL || user?.claims?.admin;

  useEffect(() => {
    if (isAdmin) {
      const fetchUnreadCount = async () => {
        const result = await getContactMessages();
        if (result.unreadCount) {
          setUnreadMessages(result.unreadCount);
        }
      };
      fetchUnreadCount();
    }
  }, [isAdmin]);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Link>
        </Button>
         <Button asChild>
          <Link href="/dashboard">
            <UserPlus className="mr-2 h-4 w-4" />
            Sign Up
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {isAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Admin Actions
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/admin/audit-log">
                <History className="mr-2 h-4 w-4" />
                Audit Log
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/messages" className="relative">
                <Mail className="mr-2 h-4 w-4" />
                View Messages
                {unreadMessages > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0"
                  >
                    {unreadMessages}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {pathname !== '/dashboard' && (
        <Button asChild>
            <Link href="/dashboard">
                Go to Dashboard
            </Link>
        </Button>
      )}
      <div className="flex items-center gap-2">
        {user.displayName && (
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
            Welcome, {user.displayName}
          </span>
        )}
        <Button onClick={signOut} variant="outline">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
