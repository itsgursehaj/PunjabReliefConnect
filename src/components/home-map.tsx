
"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { AlertTriangle, MapPin } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import Link from "next/link";

interface VillageGroup {
  villageName: string;
  district: string;
  lat: number | null;
  lng: number | null;
  combinedNeeds: string;
}

interface HomeMapProps {
  villageGroups: VillageGroup[];
}

function MapControl({ villageGroups }: { villageGroups: VillageGroup[] }) {
    const map = useMap();

    useEffect(() => {
      if (map && villageGroups.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        villageGroups.forEach(village => {
          if (village.lat && village.lng) {
            bounds.extend({ lat: village.lat, lng: village.lng });
          }
        });
        if (bounds.isEmpty() || bounds.getNorthEast().equals(bounds.getSouthWest())) {
           if (villageGroups.length === 1 && villageGroups[0].lat && villageGroups[0].lng) {
              map.setCenter({ lat: villageGroups[0].lat, lng: villageGroups[0].lng });
              map.setZoom(10);
           } else {
              map.setCenter({ lat: 31.1471, lng: 75.3412 });
              map.setZoom(7);
           }
        } else {
           map.fitBounds(bounds, 50);
        }
      } else if (map && villageGroups.length === 0) {
          map.setCenter({ lat: 31.1471, lng: 75.3412 });
          map.setZoom(7);
      }
    }, [villageGroups, map]);

    return null;
}

export default function HomeMap({ villageGroups }: HomeMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [selectedVillage, setSelectedVillage] = useState<VillageGroup | null>(null);

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Google Maps API Key is Missing</AlertTitle>
          <AlertDescription>
            The map requires a Google Maps API key to be displayed.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={{ lat: 31.1471, lng: 75.3412 }} // Punjab
        defaultZoom={7}
        mapId="a2b3c4d5e6f7g8h9" // Replace with your Map ID
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        className="w-full h-full rounded-xl"
      >
        {villageGroups.map(
          (village) =>
            village.lat &&
            village.lng && (
              <AdvancedMarker
                key={village.villageName}
                position={{ lat: village.lat, lng: village.lng }}
                onClick={() => setSelectedVillage(village)}
              >
                 <div
                    className="w-4 h-4 rounded-full bg-red-500"
                    style={{
                        border: '2px solid white',
                        boxShadow: '0 0 0 2px #ef4444',
                    }}
                    title={village.villageName}
                />
              </AdvancedMarker>
            )
        )}
        
        {selectedVillage && selectedVillage.lat && selectedVillage.lng && (
            <InfoWindow 
              position={{ lat: selectedVillage.lat, lng: selectedVillage.lng }}
              onCloseClick={() => setSelectedVillage(null)}
              >
                <div className="p-2 w-64 space-y-2">
                    <h3 className="font-bold text-base">{selectedVillage.villageName}</h3>
                    <p className="text-xs"><span className="font-semibold">Needs:</span></p>
                    <p className="text-xs max-h-20 overflow-y-auto">{selectedVillage.combinedNeeds}</p>
                     <Button asChild size="sm" className="w-full">
                        <Link href={`/village/${encodeURIComponent(selectedVillage.villageName)}`}>
                           View Details & Volunteer
                        </Link>
                    </Button>
                </div>
            </InfoWindow>
        )}
        <MapControl villageGroups={villageGroups} />
      </Map>
    </APIProvider>
  );
}
