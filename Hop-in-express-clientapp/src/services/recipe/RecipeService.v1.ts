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
    image: "https://www.recipetineats.com/wp-content/uploads/2018/04/Shepherds-Pie-3.jpg",
    cookingTime: "45 Mins",
    difficulty: "Medium",
    totalPrice: 15.50,
    ingredients: [
        { name: "Minced Lamb (500g)", price: 6.50, image: "https://cdn-icons-png.flaticon.com/512/10609/10609054.png" },
        { name: "Maris Piper Potatoes (2kg)", price: 2.50, image: "https://cdn-icons-png.flaticon.com/512/7397/7397262.png" },
        { name: "Frozen Peas", price: 2.00, image: "https://cdn-icons-png.flaticon.com/512/12338/12338380.png" },
        { name: "Bisto Gravy", price: 4.50, image: "https://cdn-icons-png.flaticon.com/512/862/862803.png" }
    ]
};

export class RecipeService {
    static getSeasonalRecipes(): RecipeBundle[] {
        return [MOCK_SHEPHERDS_PIE];
    }
}
