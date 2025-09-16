
'use server';

type GeocodeResult = {
    coordinates: { lat: number; lng: number } | null;
    error: string | null;
}

export async function getCoordinates(address: string): Promise<GeocodeResult> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        const errorMessage = "Google Maps API key is not set. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file to enable location services.";
        console.error(errorMessage);
        return { coordinates: null, error: errorMessage };
    }
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results[0]) {
            const location = data.results[0].geometry.location;
            return { coordinates: { lat: location.lat, lng: location.lng }, error: null };
        } else {
            console.error('Geocoding failed:', data.status, data.error_message);
             if (data.status === 'REQUEST_DENIED') {
                return { coordinates: null, error: 'Geocoding request was denied. Please check your Google Maps API key and ensure the Geocoding API is enabled in your Google Cloud project.' };
            }
            return { coordinates: null, error: `Geocoding failed. Status: ${data.status}` };
        }
    } catch (error) {
        console.error('Error during geocoding fetch:', error);
        return { coordinates: null, error: 'An unexpected error occurred during the geocoding request.' };
    }
}
