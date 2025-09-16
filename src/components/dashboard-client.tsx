
"use client";

import { useEffect, useState, useMemo } from "react";
import type { Village } from "@/types";
import { useReliefData } from "@/hooks/use-relief-data";
import VillageTable from "@/components/village-table";
import type { VillageGroup } from "@/components/village-table";
import VillageMap from "@/components/village-map";
import DeleteConfirmationDialog from "./delete-confirmation-dialog";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import type { User as FirebaseAuthUser } from 'firebase/auth';
import DashboardFilters from "./dashboard-filters";

interface AppUser extends FirebaseAuthUser {
    claims?: { [key: string]: any };
}
interface DashboardClientProps {
    user: AppUser | null;
}

const PRIMARY_ADMIN_EMAIL = process.env.NEXT_PUBLIC_PRIMARY_ADMIN_EMAIL;

export default function DashboardClient({ user }: DashboardClientProps) {
  const { data: allVillages, loading: dataLoading, error, setData: setAllVillages } = useReliefData();
  const [selectedVillageId, setSelectedVillageId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [villageToDelete, setVillageToDelete] = useState<Village | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const isAdmin = user?.email === PRIMARY_ADMIN_EMAIL || user?.claims?.admin;

  const filteredVillages = useMemo(() => {
    return allVillages
      .filter(village => village.status !== 'closed') // Filter out closed requests
      .filter(village => {
        const matchesSearch = village.villageName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDistrict = selectedDistrict === 'all' || village.district === selectedDistrict;
        return matchesSearch && matchesDistrict;
      });
  }, [allVillages, searchTerm, selectedDistrict]);

  const villageGroups = useMemo(() => {
      const groups: { [key: string]: VillageGroup } = {};

      filteredVillages.forEach(request => {
          const key = request.villageName.trim().toLowerCase();
          if (!groups[key]) {
              groups[key] = {
                  villageName: request.villageName,
                  district: request.district,
                  requests: [],
                  totalViews: 0,
                  totalVolunteers: 0,
                  totalReports: 0,
                  totalCloseVotes: 0,
                  combinedNeeds: "",
                  mostRecentTimestamp: ""
              };
          }
          
          groups[key].requests.push(request);
          groups[key].totalViews += (request.views || 0);
          
          const villageVolunteers = new Set<string>();
          groups[key].requests.forEach(r => r.assignedTo?.forEach(v => villageVolunteers.add(v.email)));
          groups[key].totalVolunteers = villageVolunteers.size;

          groups[key].totalReports += (request.reports?.length || 0);

          const closeVoteUsers = new Set<string>();
          groups[key].requests.forEach(r => r.closeVotes?.forEach(v => closeVoteUsers.add(v.userId)));
          groups[key].totalCloseVotes = closeVoteUsers.size;

          if (!groups[key].mostRecentTimestamp || new Date(request.timestamp) > new Date(groups[key].mostRecentTimestamp)) {
              groups[key].mostRecentTimestamp = request.timestamp;
          }
      });
      
      const sortedGroups = Object.values(groups).sort((a, b) => {
          if (sortBy === 'newest') {
            return new Date(b.mostRecentTimestamp).getTime() - new Date(a.mostRecentTimestamp).getTime();
          }
          if (sortBy === 'oldest') {
            return new Date(a.mostRecentTimestamp).getTime() - new Date(b.mostRecentTimestamp).getTime();
          }
          if (sortBy === 'volunteers') {
            return b.totalVolunteers - a.totalVolunteers;
          }
          return new Date(b.mostRecentTimestamp).getTime() - new Date(a.mostRecentTimestamp).getTime();
      });

       sortedGroups.forEach(group => {
            const allNeeds = new Set<string>();
            group.requests.forEach(req => {
                req.needs.split(',').forEach(need => allNeeds.add(need.trim()));
            });
            group.combinedNeeds = Array.from(allNeeds).join(', ');
        });

      return sortedGroups;

  }, [filteredVillages, sortBy]);


  const selectedVillage = useMemo(() => {
    return allVillages.find(v => v.id === selectedVillageId) || null;
  }, [allVillages, selectedVillageId]);
  
  const handleMarkerClick = (village: Village) => {
    setSelectedVillageId(village.id);
  };
  
  const handleDeleteClick = (village: Village) => {
    setVillageToDelete(village);
    setDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (villageToDelete) {
        setAllVillages(currentVillages => currentVillages.filter(v => v.id !== villageToDelete.id));
        if (selectedVillageId === villageToDelete.id) {
            setSelectedVillageId(null);
        }
    }
    setDialogOpen(false);
    setVillageToDelete(null);
  };

  if (dataLoading) {
    return (
      <div className="w-full max-w-7xl mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Skeleton className="h-[70vh] w-full" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-[70vh] w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>
            {error} Please check your connection and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl">
       <DashboardFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <div className="w-full mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            <Card className="shadow-sm">
                <CardHeader className="border-b">
                    <CardTitle className="text-xl">
                        Village Needs / ਪਿੰਡ ਦੀਆਂ ਲੋੜਾਂ ({villageGroups.length})
                    </CardTitle>
                </CardHeader>
                <div className="max-h-[70vh] overflow-y-auto">
                    <VillageTable
                      villageGroups={villageGroups}
                      onDeleteClick={handleDeleteClick}
                      isAdmin={isAdmin}
                    />
                </div>
            </Card>
        </div>

        <div className="lg:col-span-1 bg-card rounded-xl border shadow-sm p-2 sticky top-8 h-[80vh]">
             <VillageMap
                    villages={filteredVillages}
                    selectedVillage={selectedVillage}
                    onMarkerClick={handleMarkerClick}
                />
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
    </div>
  );
}
