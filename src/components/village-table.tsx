

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Village } from "@/types";
import { Trash2, AlertTriangle, Eye, Users, ChevronRight, FileText, CheckCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";

export interface VillageGroup {
  villageName: string;
  district: string;
  requests: Village[];
  totalViews: number;
  totalVolunteers: number;
  totalReports: number;
  totalCloseVotes: number;
  combinedNeeds: string;
  mostRecentTimestamp: string;
}

interface VillageTableProps {
  villageGroups: VillageGroup[];
  onDeleteClick: (village: Village) => void;
  isAdmin: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function VillageTable({
  villageGroups,
  onDeleteClick,
  isAdmin,
}: VillageTableProps) {
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);
  const router = useRouter();

  if (!villageGroups || villageGroups.length === 0) {
    return <p className="p-4 text-center text-muted-foreground">No requests found. / ਕੋਈ ਬੇਨਤੀ ਨਹੀਂ ਮਿਲੀ।</p>;
  }

  const showMoreItems = () => {
    setVisibleItems((prev) => prev + ITEMS_PER_PAGE);
  };
  
  const handleRowClick = (villageName: string) => {
      router.push(`/village/${encodeURIComponent(villageName)}`);
  };


  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Village / ਪਿੰਡ</TableHead>
              <TableHead>Needs / ਲੋੜਾਂ</TableHead>
              <TableHead>Last Updated / ਆਖਰੀ ਵਾਰ ਅੱਪਡੇਟ ਕੀਤਾ</TableHead>
              <TableHead className="text-right">Info / ਜਾਣਕਾਰੀ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {villageGroups.slice(0, visibleItems).map((group) => {
              return (
                <TableRow
                    key={group.villageName}
                    onClick={() => handleRowClick(group.villageName)}
                    className={cn("cursor-pointer", {
                       "bg-amber-500/10 hover:bg-amber-500/20": isAdmin && group.totalReports > 0,
                    })}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                          <span className="font-semibold">{group.villageName} ({group.requests.length})</span>
                          <span className="text-xs text-muted-foreground">{group.district}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs text-xs">{group.combinedNeeds}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                       {format(new Date(group.mostRecentTimestamp), "PPp")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3 text-muted-foreground">
                          {group.totalCloseVotes > 0 && isAdmin && (
                              <div className="flex items-center gap-1" title={`${group.totalCloseVotes} close vote(s)`}>
                                  <CheckCircle className="h-4 w-4 text-blue-500"/>
                                  <span className="text-xs">{group.totalCloseVotes}</span>
                              </div>
                          )}
                          {group.totalReports > 0 && (
                               <div className="flex items-center gap-1" title={`${group.totalReports} report(s)`}>
                                  <AlertTriangle className="h-4 w-4 text-amber-500"/>
                                  <span className="text-xs">{group.totalReports}</span>
                              </div>
                          )}
                          {group.totalVolunteers > 0 && (
                              <div className="flex items-center gap-1" title={`${group.totalVolunteers} volunteer(s)`}>
                                  <Users className="h-4 w-4 text-green-500"/>
                                  <span className="text-xs">{group.totalVolunteers}</span>
                              </div>
                          )}
                          <div className="flex items-center gap-1" title={`${group.totalViews} view(s)`}>
                              <Eye className="h-4 w-4" />
                              <span className="text-xs">{group.totalViews}</span>
                          </div>
                          <ChevronRight className="h-4 w-4" />
                      </div>
                    </TableCell>
                  </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 p-2 sm:p-4">
        {villageGroups.slice(0, visibleItems).map((group) => (
            <Card key={group.villageName} onClick={() => handleRowClick(group.villageName)} className={cn("cursor-pointer active:border-primary", {
                "border-amber-500/50 bg-amber-500/5": isAdmin && group.totalReports > 0
            })}>
                <CardHeader className="p-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">{group.villageName} ({group.requests.length})</CardTitle>
                        <CardDescription className="text-xs">{group.district}</CardDescription>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                    <div>
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Needs</h4>
                        <p className="text-sm line-clamp-3">{group.combinedNeeds}</p>
                    </div>
                     <div>
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Last Updated</h4>
                        <p className="text-sm">{format(new Date(group.mostRecentTimestamp), "PPp")}</p>
                    </div>
                    <div className="flex items-center justify-end gap-4 text-muted-foreground border-t pt-3 mt-3">
                         {group.totalCloseVotes > 0 && isAdmin && (
                              <div className="flex items-center gap-1.5" title={`${group.totalCloseVotes} close vote(s)`}>
                                  <CheckCircle className="h-4 w-4 text-blue-500"/>
                                  <span className="text-sm font-medium">{group.totalCloseVotes}</span>
                              </div>
                          )}
                         {group.totalReports > 0 && (
                             <div className="flex items-center gap-1.5" title={`${group.totalReports} report(s)`}>
                                <AlertTriangle className="h-4 w-4 text-amber-500"/>
                                <span className="text-sm font-medium">{group.totalReports}</span>
                            </div>
                        )}
                        {group.totalVolunteers > 0 && (
                            <div className="flex items-center gap-1.5" title={`${group.totalVolunteers} volunteer(s)`}>
                                <Users className="h-4 w-4 text-green-500"/>
                                <span className="text-sm font-medium">{group.totalVolunteers}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5" title={`${group.totalViews} view(s)`}>
                            <Eye className="h-4 w-4" />
                            <span className="text-sm font-medium">{group.totalViews}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>


      {visibleItems < villageGroups.length && (
        <div className="p-4 text-center">
          <Button onClick={showMoreItems} variant="outline">Load More</Button>
        </div>
      )}
    </>
  );
}
