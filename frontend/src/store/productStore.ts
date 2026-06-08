import { create } from 'zustand';
import { MOCK_PRODUCTS, type Product, type SortType, sortProducts } from '../data/mockData';

interface ProductState {
  products: Product[];
  filteredProducts: Product[];
  selectedCategory: string;
  searchQuery: string;
  sortBy: SortType;
  isLoading: boolean;
  votedProducts: Set<string>;
  setCategory: (category: string) => void;
  setSearch: (query: string) => void;
  setSortBy: (sort: SortType) => void;
  toggleVote: (productId: string, userId: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'votesCount' | 'commentsCount' | 'viewsCount' | 'createdAt' | 'status'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  approveProduct: (id: string) => void;
  rejectProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  applyFilters: () => void;
}

export const useProductStore = create<ProductState>()((set, get) => ({
  products: MOCK_PRODUCTS.map(p => ({ ...p })),
  filteredProducts: [...MOCK_PRODUCTS],
  selectedCategory: 'All',
  searchQuery: '',
  sortBy: 'trending',
  isLoading: false,
  votedProducts: new Set<string>(),

  setCategory: (category: string) => {
    set({ selectedCategory: category });
    get().applyFilters();
  },

  setSearch: (query: string) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  setSortBy: (sort: SortType) => {
    set({ sortBy: sort });
    get().applyFilters();
  },

  toggleVote: (productId: string, userId: string) => {
    const { products, votedProducts } = get();
    const key = `${userId}_${productId}`;
    const hasVoted = votedProducts.has(key);
    const newVoted = new Set(votedProducts);

    if (hasVoted) {
      newVoted.delete(key);
    } else {
      newVoted.add(key);
    }

    const newProducts = products.map(p =>
      p.id === productId
        ? { ...p, votesCount: p.votesCount + (hasVoted ? -1 : 1), hasVoted: !hasVoted }
        : p
    );

    set({ products: newProducts, votedProducts: newVoted });
    get().applyFilters();
  },

  addProduct: (productData) => {
    const newProduct: Product = {
      ...productData,
      id: `p_${Date.now()}`,
      votesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    set(state => ({ products: [newProduct, ...state.products] }));
    get().applyFilters();
    return newProduct;
  },

  updateProduct: (id, updates) => {
    set(state => ({
      products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
    get().applyFilters();
  },

  deleteProduct: (id) => {
    set(state => ({ products: state.products.filter(p => p.id !== id) }));
    get().applyFilters();
  },

  approveProduct: (id) => {
    get().updateProduct(id, { status: 'approved' });
  },

  rejectProduct: (id) => {
    get().updateProduct(id, { status: 'rejected' });
  },

  getProductById: (id) => {
    return get().products.find(p => p.id === id);
  },

  applyFilters: () => {
    const { products, selectedCategory, searchQuery, sortBy } = get();
    let filtered = products.filter(p => p.status === 'approved');

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      );
    }

    set({ filteredProducts: sortProducts(filtered, sortBy) });
  },
}));
