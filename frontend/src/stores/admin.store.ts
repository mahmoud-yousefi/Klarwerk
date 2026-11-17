import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AdminCustomer,
  AdminMessage,
  AdminOrder,
  AdminRequest,
  AdminReview,
  AdminSettings,
  MessageStatus,
  OrderStatus,
} from '@/types/admin';
import {
  seedCustomers,
  seedMessages,
  seedOrders,
  seedRequests,
  seedReviews,
  seedSettings,
} from '@/data/adminSeed';
import {
  readCustomCatalog,
  removeCustomCategory,
  removeCustomProduct,
  saveCustomCategory,
  saveCustomProduct,
} from '@/lib/customCatalog';
import type { Category, Product } from '@/types/catalog';

interface AdminState {
  orders: AdminOrder[];
  customers: AdminCustomer[];
  messages: AdminMessage[];
  requests: AdminRequest[];
  reviews: AdminReview[];
  settings: AdminSettings;
  customProducts: Product[];
  customCategories: Category[];
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateMessageStatus: (id: string, status: MessageStatus) => void;
  replyToMessage: (id: string, text: string) => void;
  updateRequestStatus: (id: string, status: AdminRequest['status']) => void;
  updateSettings: (patch: Partial<AdminSettings>) => void;
  publishProduct: (product: Product) => void;
  publishCategory: (category: Category) => void;
  deleteProduct: (id: string) => void;
  deleteCategory: (id: string) => void;
  resetWorkspace: () => void;
  resetContent: () => void;
}

const runtime = readCustomCatalog();

const dataSeed = () => ({
  orders: seedOrders,
  customers: seedCustomers,
  messages: seedMessages,
  requests: seedRequests,
  reviews: seedReviews,
  settings: seedSettings,
});

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      ...dataSeed(),
      customProducts: runtime.products,
      customCategories: runtime.categories,
      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((order) => (order.id === id ? { ...order, status } : order)),
        })),
      updateMessageStatus: (id, status) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === id ? { ...message, status } : message,
          ),
        })),
      replyToMessage: (id, text) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === id
              ? {
                  ...message,
                  status: 'resolved',
                  replies: [
                    ...message.replies,
                    { author: 'team', text, date: new Date().toISOString() },
                  ],
                }
              : message,
          ),
        })),
      updateRequestStatus: (id, status) =>
        set((state) => ({
          requests: state.requests.map((request) =>
            request.id === id ? { ...request, status } : request,
          ),
        })),
      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
      publishProduct: (product) => {
        saveCustomProduct(product);
        set((state) => ({
          customProducts: [
            product,
            ...state.customProducts.filter((entry) => entry.id !== product.id),
          ],
        }));
      },
      publishCategory: (category) => {
        saveCustomCategory(category);
        set((state) => ({
          customCategories: [
            category,
            ...state.customCategories.filter((entry) => entry.id !== category.id),
          ],
        }));
      },
      deleteProduct: (id) => {
        removeCustomProduct(id);
        set((state) => ({
          customProducts: state.customProducts.filter((entry) => entry.id !== id),
        }));
      },
      deleteCategory: (id) => {
        removeCustomCategory(id);
        set((state) => ({
          customCategories: state.customCategories.filter((entry) => entry.id !== id),
        }));
      },
      resetWorkspace: () => set({ ...dataSeed() }),
      resetContent: () => {
        window.localStorage.removeItem('klarwerk.custom-catalog.v1');
        set({ customProducts: [], customCategories: [] });
      },
    }),
    {
      name: 'klarwerk.admin.v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        orders: state.orders,
        customers: state.customers,
        messages: state.messages,
        requests: state.requests,
        reviews: state.reviews,
        settings: state.settings,
        customProducts: state.customProducts,
        customCategories: state.customCategories,
      }),
    },
  ),
);
