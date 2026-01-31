
import { Recipe, UserProfile } from './types';

export const MOCK_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Slow-Cooker Chicken Tortilla Soup',
    image: 'https://picsum.photos/seed/soup/800/800',
    time: '4h 10min',
    calories: 444,
    fat: '12g',
    carbs: '19g',
    protein: '17g',
    rating: 4.6,
    reviews: 295,
    ingredients: ['Chicken breasts', 'Garlic cloves', 'Chicken broth', 'Fire-roasted tomatoes', 'Onion', 'Corn', 'Cilantro'],
    directions: [
      'Place chicken in slow cooker.',
      'Add chopped onion, garlic, and tomatoes.',
      'Pour in broth and spices.',
      'Cook on low for 4 hours.',
      'Shred chicken and serve.'
    ],
    category: 'Lunch'
  },
  {
    id: '2',
    title: 'Avocado Toast with Poached Egg',
    image: 'https://picsum.photos/seed/toast/800/800',
    time: '15min',
    calories: 320,
    fat: '22g',
    carbs: '24g',
    protein: '12g',
    rating: 4.8,
    reviews: 120,
    ingredients: ['Sourdough bread', 'Ripe avocado', 'Eggs', 'Red pepper flakes', 'Lemon juice'],
    directions: [
      'Toast the sourdough bread until golden.',
      'Mash avocado with lemon juice and salt.',
      'Poach eggs in simmering water for 3 minutes.',
      'Spread avocado on toast and top with egg.'
    ],
    category: 'Breakfast'
  }
];

export const MOCK_USER: UserProfile = {
  name: 'Isabella Martinez',
  level: 47,
  points: 1250,
  avatar: 'https://i.pravatar.cc/150?u=isabella',
  posts: [
    { id: 'p1', image: 'https://picsum.photos/seed/p1/400/400', title: 'Perfect Pasta', likes: 124, comments: 12 },
    { id: 'p2', image: 'https://picsum.photos/seed/p2/400/400', title: 'Summer Salad', likes: 89, comments: 5 },
    { id: 'p3', image: 'https://picsum.photos/seed/p3/400/400', title: 'Homemade Pizza', likes: 231, comments: 42 }
  ]
};
