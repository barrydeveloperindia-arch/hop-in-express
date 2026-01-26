/**
 * LogisticsService v1.0.0
 * Handles Geospatial Logic for Eastleigh, UK Context.
 */

// Coordinates for Eastleigh Central (Simulated Dark Store)
const DARK_STORE_LOCATION = {
    lat: 50.9675,
    lng: -1.3537
};

// Average speed in urban Eastleigh (km/h) accounting for traffic
const AVERAGE_SPEED_KMH = 30;
const PREPARATION_TIME_MIN = 5;

export interface Coordinates {
    lat: number;
    lng: number;
}

export class LogisticsService {

    /**
     * Calculates delivery time based on Haversine distance + prep time.
     * Mimics Dijkstra’s algorithm heuristic for MVP.
     */
    static calculateDeliveryTime(userLocation: Coordinates): number {
        const distanceKm = this.getDistanceFromLatLonInKm(
            DARK_STORE_LOCATION.lat,
            DARK_STORE_LOCATION.lng,
            userLocation.lat,
            userLocation.lng
        );

        // Time = Distance / Speed
        const travelTimeHours = distanceKm / AVERAGE_SPEED_KMH;
        const travelTimeMin = Math.ceil(travelTimeHours * 60);

        return travelTimeMin + PREPARATION_TIME_MIN;
    }

    /**
     * Haversine Formula for geospatial distance
     */
    private static getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }

    private static deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}
