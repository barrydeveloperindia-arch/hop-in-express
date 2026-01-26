export type Product = {
    id: string;
    name: string;
    brand: string;
    category: 'Snacks' | 'Beverages' | 'Pantry' | 'Frozen' | 'Fresh';
    price: number;
    memberPrice: number;
    image: string;
    tags: ('Veg' | 'Halal' | 'Gluten-Free' | 'Frozen')[];
    description?: string;
    origin?: string;
    size?: string; // e.g., "10kg", "330ml"
};

export const BRANDS = [
    { id: 'haldiram', name: "Haldiram's", logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Haldiram%27s_Logo.svg' }, // Placeholder logo handling might be needed if SVG, preferring PNG for React Native usually but web handles it. Let's use text or simple placeholders if needed.
    { id: 'tilda', name: 'Tilda', logo: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=500&auto=format&fit=crop' }, // Mocking with rice image
    { id: 'rubicon', name: 'Rubicon', logo: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=500&auto=format&fit=crop' },
    { id: 'shan', name: 'Shan', logo: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=500' },
    { id: 'cofresh', name: 'Cofresh', logo: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?q=80&w=500' },
];

export const INVENTORY: Product[] = [
    // --- Swicy & Snacking ---
    {
        id: '1',
        name: 'Aloo Bhujia',
        brand: "Haldiram's",
        category: 'Snacks',
        price: 3.50,
        memberPrice: 2.99,
        image: 'https://images.unsplash.com/photo-1566498522303-3482fc6a59b6?q=80&w=1000', // Mocking spicy snack
        tags: ['Veg'],
        size: '200g',
        origin: 'India'
    },
    {
        id: '2',
        name: 'Gulab Jamun',
        brand: "Haldiram's",
        category: 'Snacks',
        price: 6.50,
        memberPrice: 5.50,
        image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?q=80&w=1000',
        tags: ['Veg'],
        size: '1kg Box',
        origin: 'India'
    },
    {
        id: '3',
        name: 'Bombay Mix',
        brand: 'Cofresh',
        category: 'Snacks',
        price: 2.00,
        memberPrice: 1.50,
        image: 'https://images.unsplash.com/photo-1606491956689-2ea28c674675?q=80&w=1000',
        tags: ['Veg'],
        size: '300g'
    },

    // --- Nostalgia Beverages ---
    {
        id: '4',
        name: 'Thums Up',
        brand: 'Coca-Cola',
        category: 'Beverages',
        price: 1.25,
        memberPrice: 1.00,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1000', // Cola generic
        tags: ['Veg'],
        size: '330ml Glass',
        description: 'The taste of thunder. Authentic strong cola from India.'
    },
    {
        id: '5',
        name: 'Limca',
        brand: 'Coca-Cola',
        category: 'Beverages',
        price: 1.25,
        memberPrice: 1.00,
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1000', // Lime generic
        tags: ['Veg'],
        size: '330ml Can',
        description: 'Lemony fizz for the ultimate refreshment.'
    },
    {
        id: '6',
        name: 'Mango Maaza',
        brand: 'Coca-Cola',
        category: 'Beverages',
        price: 3.00,
        memberPrice: 2.50,
        image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?q=80&w=1000',
        tags: ['Veg'],
        size: '1.2L Bottle'
    },

    // --- Premium Pantry (Bulk) ---
    {
        id: '7',
        name: 'Pure Basmati Rice',
        brand: 'Tilda',
        category: 'Pantry',
        price: 18.00,
        memberPrice: 14.99,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=1000',
        tags: ['Veg', 'Gluten-Free'],
        size: '5kg',
        description: 'The grain of truth. Perfect fluffy grains every time.'
    },
    {
        id: '8',
        name: 'Elephant Atta Medium',
        brand: 'Elephant',
        category: 'Pantry',
        price: 12.00,
        memberPrice: 9.99,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000', // Flour generic
        tags: ['Veg'],
        size: '10kg',
        description: 'Essential for soft, fluffy chapatis.'
    },

    // --- Frozen & Fresh ---
    {
        id: '9',
        name: 'Frozen Okra (Bhindi)',
        brand: 'Shana',
        category: 'Frozen',
        price: 2.50,
        memberPrice: 2.00,
        image: 'https://images.unsplash.com/photo-1425543103986-226d3d8db13d?q=80&w=1000',
        tags: ['Veg', 'Frozen'],
        size: '300g'
    },
    {
        id: '10',
        name: 'Plain Paratha',
        brand: 'Ashoka',
        category: 'Frozen',
        price: 3.00,
        memberPrice: 2.50,
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000', // Roti generic
        tags: ['Veg', 'Frozen'],
        size: '5 Pack'
    },

    // --- The Hero ---
    {
        id: '11',
        name: 'Organic Nano Banana',
        brand: 'Hop-In Select',
        category: 'Fresh',
        price: 3.50,
        memberPrice: 2.99,
        image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=1887&auto=format&fit=crop',
        tags: ['Veg'],
        size: 'Bunch',
        origin: 'Costa Rica'
    }
];
