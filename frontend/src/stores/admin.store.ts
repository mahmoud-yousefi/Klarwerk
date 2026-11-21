import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AdminCustomer,
  AdminMessage,
  AdminOrder,
  AdminRequest,
  AdminReview,
  AdminSettings,
  FulfillmentJob,
  FulfillmentStage,
  MessageStatus,
  OrderStatus,
  PurchaseOrder,
  RestockInput,
  StockMovement,
  StockOverride,
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
  seedFulfillmentJobs,
  seedMovements,
  seedPurchaseOrders,
} from '@/data/operationsSeed';
import { buildStockRows } from '@/lib/operations';
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
  purchaseOrders: PurchaseOrder[];
  fulfillmentJobs: FulfillmentJob[];
  stockMovements: StockMovement[];
  stockOverrides: Record<string, StockOverride>;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateMessageStatus: (id: string, status: MessageStatus) => void;
  replyToMessage: (id: string, text: string) => void;
  updateRequestStatus: (id: string, status: AdminRequest['status']) => void;
  updateSettings: (patch: Partial<AdminSettings>) => void;
  publishProduct: (product: Product) => void;
  publishCategory: (category: Category) => void;
  deleteProduct: (id: string) => void;
  deleteCategory: (id: string) => void;
  setJobStage: (id: string, stage: FulfillmentStage) => void;
  advanceJob: (id: string) => void;
  restockStock: (input: RestockInput) => void;
  receivePurchaseOrder: (id: string) => void;
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
  purchaseOrders: seedPurchaseOrders,
  fulfillmentJobs: seedFulfillmentJobs,
  stockMovements: seedMovements,
  stockOverrides: {} as Record<string, StockOverride>,
});

const nextStage: Record<FulfillmentStage, FulfillmentStage> = {
  received: 'picking',
  picking: 'packing',
  packing: 'labeling',
  labeling: 'dispatch',
  dispatch: 'delivered',
  exception: 'picking',
  delivered: 'delivered',
};

const movementId = () =>
  `mv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

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
      setJobStage: (id, stage) =>
        set((state) => ({
          fulfillmentJobs: state.fulfillmentJobs.map((job) =>
            job.id === id
              ? {
                  ...job,
                  stage,
                  exceptionReason: stage === 'exception' ? job.exceptionReason : undefined,
                }
              : job,
          ),
        })),
      advanceJob: (id) =>
        set((state) => ({
          fulfillmentJobs: state.fulfillmentJobs.map((job) =>
            job.id === id ? { ...job, stage: nextStage[job.stage], exceptionReason: undefined } : job,
          ),
        })),
      restockStock: (input) =>
        set((state) => {
          const current = state.stockOverrides[input.productId]?.onHand ?? input.onHand;
          const movement: StockMovement = {
            id: movementId(),
            date: new Date().toISOString(),
            type: 'inbound',
            productId: input.productId,
            productName: input.productName,
            sku: input.sku,
            quantity: input.quantity,
            toWarehouse: input.warehouse,
            reference: `MAN-${input.zone}`,
            operator: 'Admin',
          };
          return {
            stockOverrides: {
              ...state.stockOverrides,
              [input.productId]: {
                onHand: current + input.quantity,
                warehouse: input.warehouse,
              },
            },
            stockMovements: [movement, ...state.stockMovements],
          };
        }),
      receivePurchaseOrder: (id) =>
        set((state) => {
          const order = state.purchaseOrders.find((entry) => entry.id === id);
          if (!order || order.status === 'received') return {};
          const rows = buildStockRows(state.stockOverrides, state.purchaseOrders);
          const overrides = { ...state.stockOverrides };
          const movements: StockMovement[] = [];
          const date = new Date().toISOString();

          order.lines.forEach((line) => {
            const row = rows.find(
              (entry) => entry.productId === line.productId || entry.sku === line.sku,
            );
            const current = overrides[line.productId]?.onHand ?? row?.onHand ?? 0;
            overrides[line.productId] = {
              onHand: current + line.qty,
              warehouse: order.warehouse,
            };
            movements.push({
              id: movementId(),
              date,
              type: 'inbound',
              productId: line.productId,
              productName: line.name,
              sku: line.sku,
              quantity: line.qty,
              toWarehouse: order.warehouse,
              reference: order.id,
              operator: 'Wareneingang',
            });
          });

          return {
            purchaseOrders: state.purchaseOrders.map((entry) =>
              entry.id === id ? { ...entry, status: 'received' } : entry,
            ),
            stockOverrides: overrides,
            stockMovements: [...movements, ...state.stockMovements],
          };
        }),
      resetWorkspace: () => set({ ...dataSeed() }),
      resetContent: () => {
        window.localStorage.removeItem('klarwerk.custom-catalog.v1');
        set({ customProducts: [], customCategories: [] });
      },
    }),
    {
      name: 'klarwerk.admin.v1',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState) => {
        const persisted = persistedState as Partial<AdminState>;
        return {
          ...persisted,
          purchaseOrders: persisted.purchaseOrders ?? seedPurchaseOrders,
          fulfillmentJobs: persisted.fulfillmentJobs ?? seedFulfillmentJobs,
          stockMovements: persisted.stockMovements ?? seedMovements,
          stockOverrides: persisted.stockOverrides ?? {},
        };
      },
      partialize: (state) => ({
        orders: state.orders,
        customers: state.customers,
        messages: state.messages,
        requests: state.requests,
        reviews: state.reviews,
        settings: state.settings,
        customProducts: state.customProducts,
        customCategories: state.customCategories,
        purchaseOrders: state.purchaseOrders,
        fulfillmentJobs: state.fulfillmentJobs,
        stockMovements: state.stockMovements,
        stockOverrides: state.stockOverrides,
      }),
    },
  ),
);
