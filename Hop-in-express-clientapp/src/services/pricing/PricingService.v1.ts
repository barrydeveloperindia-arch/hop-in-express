/**
 * PricingService v1.0.0
 * Dynamic Pricing Engine (Simulating Python ML Model)
 */

export class PricingService {

    /**
     * Calculates dynamic delivery fee based on:
     * 1. Cart Value (Low value = Higher fee)
     * 2. Time of Day (Surge pricing during 6PM-9PM)
     * 3. Current Weather (Simulated)
     */
    static calculateDeliveryFee(cartValue: number): number {
        let fee = 1.99; // Base fee

        // 1. Cart Value Logic
        if (cartValue > 15) {
            fee = 0; // Free delivery over £15
        } else if (cartValue < 10) {
            fee += 2.00; // Small basket surcharge
        }

        // 2. Surge Pricing (Time of Day - Eastleigh Context)
        const hour = new Date().getHours();
        const isEveningRush = hour >= 17 && hour <= 20; // 5 PM - 8 PM

        if (isEveningRush) {
            fee *= 1.2; // 20% Surge
        }

        // 3. Weather Factor (Random Simulation for MVP)
        // In Prod: Connect to WeatherAPI
        const isRaining = Math.random() > 0.8;
        if (isRaining) {
            fee += 1.00; // Rain surcharge
        }

        return parseFloat(fee.toFixed(2));
    }
}
