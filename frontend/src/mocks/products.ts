export interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    brand: string;
    inStock: boolean;
    onSale: boolean;
    image: string;
    hoverImage: string;
    images?: string[];
    description: string;
    rating: number; // For sort
}

// Helper to generate products
const generateProducts = () => {
    const baseProducts = [
        {
            name: 'Radiant Glow Serum',
            price: 1250,
            category: 'Skin & Hair',
            brand: 'Illiyoon',
            inStock: true,
            onSale: false,
            image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            hoverImage: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: 'A lightweight serum that brings out your natural radiance.',
            rating: 4.5,
        },
        {
            name: 'Handcrafted Jute Basket',
            price: 850,
            category: 'Gifts & Crafts',
            brand: 'HandmadeWrapper',
            inStock: true,
            onSale: true,
            image: 'https://images.unsplash.com/photo-1595867362706-96eb11354d19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            hoverImage: 'https://images.unsplash.com/photo-1519066629447-267fffa62d4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: 'Beautifully woven jute basket for your home organization needs.',
            rating: 5,
        },
        {
            name: 'Silver Oxidised Necklace',
            price: 4500,
            category: 'Jewellery',
            brand: 'Generic',
            inStock: false,
            onSale: false,
            image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            hoverImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: 'Traditional silver oxidised necklace with intricate detailing.',
            rating: 4.8,
        },
        {
            name: 'Cotton Block Print Saree',
            price: 3200,
            category: 'Women',
            brand: 'Deshi',
            inStock: true,
            onSale: true,
            image: 'https://images.unsplash.com/photo-1610189012906-fac6d58f36b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            hoverImage: 'https://images.unsplash.com/photo-1583391733958-84d72d1a9257?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: 'Elegant cotton saree with traditional block print designs.',
            rating: 4.2,
        },
        {
            name: 'Rose Gold Plated Bracelet',
            price: 1800,
            category: 'Jewellery',
            brand: 'Generic',
            inStock: true,
            onSale: false,
            image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            hoverImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: 'Minimalist rose gold bracelet suitable for daily wear.',
            rating: 4.0,
        },
        {
            name: 'Ayurvedic Hair Oil',
            price: 550,
            category: 'Skin & Hair',
            brand: 'Innisfree',
            inStock: true,
            onSale: false,
            image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            hoverImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: 'Nourishing herbal hair oil for strong and healthy hair.',
            rating: 4.6,
        },
        {
            name: 'Ceramic Flower Vase',
            price: 1200,
            category: 'Gifts & Crafts',
            brand: 'Generic',
            inStock: true,
            onSale: false,
            image: 'https://images.unsplash.com/photo-1581783342308-f792ca11df53?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            hoverImage: 'https://images.unsplash.com/photo-1490312278391-d83e161c47a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: 'Hand-painted ceramic vase to brighten up your living space.',
            rating: 4.9,
        },
        {
            name: 'Silk Dupatta',
            price: 2100,
            category: 'Women',
            brand: 'Deshi',
            inStock: true,
            onSale: true,
            image: 'https://images.unsplash.com/photo-1583391733958-84d72d1a9257?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            hoverImage: 'https://images.unsplash.com/photo-1610189012906-fac6d58f36b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: 'Luxurious silk dupatta with zari border work.',
            rating: 3.8,
        },
        {
            name: 'Green Tea Serum',
            price: 1500,
            category: 'Skin & Hair',
            brand: 'Innisfree',
            inStock: true,
            onSale: false,
            image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            hoverImage: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: 'Hydrating Green Tea seed serum.',
            rating: 4.7,
        },
        {
            name: 'Snail Mucin Essence',
            price: 2200,
            category: 'Skin & Hair',
            brand: 'Cosrx',
            inStock: true,
            onSale: false,
            image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            hoverImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: 'Advanced Snail 96 Mucin Power Essence.',
            rating: 4.9,
        },
         {
            name: 'Lip Sleeping Mask',
            price: 1400,
            category: 'Lip Care',
            brand: 'Laneige',
            inStock: true,
            onSale: true,
            image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            hoverImage: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: 'Berry Lip Sleeping Mask for smooth lips.',
            rating: 4.8,
        },
         {
            name: 'AHA BHA PHA Toner',
            price: 1600,
            category: 'Skin & Hair',
            brand: 'Some By Mi',
            inStock: true,
            onSale: false,
            image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            hoverImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: '30 Days Miracle Toner.',
            rating: 4.3,
        }
    ];

    // Generate 36 products by cycling through baseProducts
    const products: Product[] = [];
    for (let i = 0; i < 36; i++) {
        const base = baseProducts[i % baseProducts.length];
        products.push({
            ...base,
            id: i + 1,
            images: [base.image, base.hoverImage], // Populate array
        });
    }
    return products;
};

export const products: Product[] = generateProducts();
