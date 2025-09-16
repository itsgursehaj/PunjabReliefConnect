

"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import type { Village } from "@/types";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import Link from "next/link";

interface VillageMapProps {
  villages: Village[];
  selectedVillage: Village | null;
  onMarkerClick: (village: Village) => void;
}

const getUrgencyColor = (village: Village) => {
    return "#ef4444"; // red-500 for all
};

function MapControl({ selectedVillage, villages }: { selectedVillage: Village | null, villages: Village[] }) {
    const map = useMap();

    // Pan to selected village
    useEffect(() => {
        if (selectedVillage && selectedVillage.lat && selectedVillage.lng && map) {
            map.panTo({ lat: selectedVillage.lat, lng: selectedVillage.lng });
            map.setZoom(12);
        }
    }, [selectedVillage, map]);

    // Adjust bounds when village list changes
    useEffect(() => {
      if (map && villages.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        villages.forEach(village => {
          if (village.lat && village.lng) {
            bounds.extend({ lat: village.lat, lng: village.lng });
          }
        });
        if (bounds.isEmpty() || bounds.getNorthEast().equals(bounds.getSouthWest())) {
          // If only one point or no points, center on Punjab
           if (villages.length === 1 && villages[0].lat && villages[0].lng) {
              map.setCenter({ lat: villages[0].lat, lng: villages[0].lng });
              map.setZoom(10);
           } else {
              map.setCenter({ lat: 31.1471, lng: 75.3412 });
              map.setZoom(7);
           }
        } else {
           map.fitBounds(bounds, 50); // 50px padding
        }
      } else if (map && villages.length === 0) {
          // No villages match filters, reset to Punjab
          map.setCenter({ lat: 31.1471, lng: 75.3412 });
          map.setZoom(7);
      }
    }, [villages, map]);


    return null;
}


export default function VillageMap({
  villages,
  selectedVillage,
  onMarkerClick,
}: VillageMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [infoWindowVillage, setInfoWindowVillage] = useState<Village | null>(null);

  useEffect(() => {
    if (selectedVillage) {
        setInfoWindowVillage(selectedVillage);
    } else {
        setInfoWindowVillage(null);
    }
  }, [selectedVillage]);


  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Google Maps API Key is Missing</AlertTitle>
          <AlertDescription>
            To display the map, you need to provide a Google Maps API key.
            Please add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY` to your `.env` file.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleMarkerClick = (village: Village) => {
    onMarkerClick(village);
    setInfoWindowVillage(village);
  };
  
  const handleCloseInfoWindow = () => {
    setInfoWindowVillage(null);
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
        {villages.map(
          (village) =>
            village.lat &&
            village.lng && (
              <AdvancedMarker
                key={village.id}
                position={{ lat: village.lat, lng: village.lng }}
                onClick={() => handleMarkerClick(village)}
              >
                 <div
                    className="w-4 h-4 rounded-full"
                    style={{
                        backgroundColor: getUrgencyColor(village),
                        border: '2px solid white',
                        boxShadow: '0 0 0 2px ' + getUrgencyColor(village),
                    }}
                    title={village.villageName}
                />
              </AdvancedMarker>
            )
        )}
        
        {infoWindowVillage && infoWindowVillage.lat && infoWindowVillage.lng && (
            <InfoWindow 
              position={{ lat: infoWindowVillage.lat, lng: infoWindowVillage.lng }}
              onCloseClick={handleCloseInfoWindow}
              >
                <div className="p-2 w-64 space-y-2">
                    <h3 className="font-bold text-base">{infoWindowVillage.villageName}</h3>
                    <p className="text-xs"><span className="font-semibold">Needs:</span></p>
                    <p className="text-xs max-h-20 overflow-y-auto">{infoWindowVillage.needs}</p>
                     <Button asChild size="sm" className="w-full">
                        <Link href={`/village/${encodeURIComponent(infoWindowVillage.villageName)}`}>
                           View Details & Volunteer
                        </Link>
                    </Button>
                </div>
            </InfoWindow>
        )}
        <MapControl selectedVillage={selectedVillage} villages={villages} />
      </Map>
    </APIProvider>
  );
}
