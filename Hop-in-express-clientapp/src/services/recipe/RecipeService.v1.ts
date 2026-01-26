/**
 * RecipeService v1.0.0
 * Manages "One-Tap Cook" bundles.
 */

import { Product } from '../../lib/firestore';

export interface RecipeBundle {
    id: string;
    name: string;
    description: string;
    image: string;
    cookingTime: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    ingredients: Partial<Product>[]; // List of mapped inventory items
    totalPrice: number;
}

// In a real app, this would query Inventory Service to get current prices/stock
const MOCK_SHEPHERDS_PIE: RecipeBundle = {
    id: 'rec_shepherds_pie',
    name: "Shepherd's Pie",
    description: "Classic British comfort food with lamb and creamy mash.",
    // using Pexels for Shepherd's Pie to avoid blocking
    image: "https://images.pexels.com/photos/6046285/pexels-photo-6046285.jpeg?auto=compress&cs=tinysrgb&w=800",
    cookingTime: "45 Mins",
    difficulty: "Medium",
    totalPrice: 15.50,
    ingredients: [
        { name: "Minced Lamb (500g)", price: 6.50, image: "https://images.pexels.com/photos/6543261/pexels-photo-6543261.jpeg?auto=compress&cs=tinysrgb&w=300" }, // Raw meat
        { name: "Maris Piper Potatoes (2kg)", price: 2.50, image: "https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg?auto=compress&cs=tinysrgb&w=300" }, // Potatoes
        { name: "Frozen Peas", price: 2.00, image: "https://images.pexels.com/photos/255469/pexels-photo-255469.jpeg?auto=compress&cs=tinysrgb&w=300" }, // Peas
        { name: "Bisto Gravy", price: 4.50, image: "https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg?auto=compress&cs=tinysrgb&w=300" } // Dark sauce/soup
    ]
};

export class RecipeService {
    static getSeasonalRecipes(): RecipeBundle[] {
        return [MOCK_SHEPHERDS_PIE];
    }
}
