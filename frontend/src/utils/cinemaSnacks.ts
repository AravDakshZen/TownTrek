export interface SnackAddon {
  id: string;
  name: string;
  category: 'POPCORN' | 'BEVERAGE' | 'COMBO' | 'SNACK';
  price: number;
  description: string;
  image: string;
}

export const CINEMA_SNACKS: SnackAddon[] = [
  {
    id: 'caramel-popcorn-lg',
    name: 'Jumbo Caramel Popcorn',
    category: 'POPCORN',
    price: 240,
    description: 'Freshly popped golden corn glazed with crispy buttery brown caramel.',
    image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cheese-popcorn-lg',
    name: 'Classic Cheddar Cheese Popcorn',
    category: 'POPCORN',
    price: 220,
    description: 'Warm crunchy popcorn dusted with savory aged cheddar seasoning.',
    image: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'nachos-cheese-salsa',
    name: 'Crispy Tortilla Nachos & Warm Salsa',
    category: 'SNACK',
    price: 210,
    description: 'Crisp Mexican corn nachos served with melted jalapeno cheese dip & fresh salsa.',
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'coke-zero-chill',
    name: 'Fountain Coke Zero / Pepsi (Large)',
    category: 'BEVERAGE',
    price: 150,
    description: 'Chilled bubbly cola served over crisp crushed ice cubes.',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'blockbuster-duo-combo',
    name: 'Blockbuster Duo Combo (Popcorn + 2 Drinks)',
    category: 'COMBO',
    price: 450,
    description: 'Large tub of salted butter popcorn + 2 large fountain beverages. Save ₹90!',
    image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'loaded-chicken-burger',
    name: 'Smoked Crispy Chicken / Paneer Burger',
    category: 'SNACK',
    price: 260,
    description: 'Brioche bun with crunchy patty, herb mayo, and fresh lettuce.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
  },
];

