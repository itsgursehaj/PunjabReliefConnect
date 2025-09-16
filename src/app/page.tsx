import { getReliefRequests } from "@/app/actions";
import type { Village } from "@/types";
import HomeClient from "./home-client";

interface VillageGroup {
  villageName: string;
  district: string;
  lat: number | null;
  lng: number | null;
  combinedNeeds: string;
}

export default async function Home() {
  const { data: allVillages } = await getReliefRequests(true);
  
  let villageGroups: VillageGroup[] = [];
  let totalRequests = 0;
  let totalVolunteers = 0;

  if (allVillages) {
      const groups: { [key: string]: VillageGroup } = {};
      const uniqueVolunteers = new Set<string>();

      allVillages.forEach(request => {
          const key = request.villageName.trim().toLowerCase();
          if (!groups[key]) {
              groups[key] = {
                  villageName: request.villageName,
                  district: request.district,
                  lat: request.lat,
                  lng: request.lng,
                  combinedNeeds: ""
              };
          }
          if (request.assignedTo) {
            request.assignedTo.forEach(v => uniqueVolunteers.add(v.email));
          }
      });
      
      Object.values(groups).forEach(group => {
        const requestsForGroup = allVillages.filter(v => v.villageName.trim().toLowerCase() === group.villageName.trim().toLowerCase());
        const allNeeds = new Set<string>();
        requestsForGroup.forEach(req => {
            req.needs.split(',').forEach(need => allNeeds.add(need.trim()));
        });
        group.combinedNeeds = Array.from(allNeeds).join(', ');
        villageGroups.push(group);
      });
      
      totalRequests = allVillages.length;
      totalVolunteers = uniqueVolunteers.size;
  }

  return (
    <HomeClient 
      villageGroups={villageGroups}
      totalRequests={totalRequests}
      totalVolunteers={totalVolunteers}
    />
  );
}
