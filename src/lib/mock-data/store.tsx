"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { seedBladeTypes } from "./blade-types";
import { seedCashMovements } from "./cash-movements";
import { seedCustomers } from "./customers";
import { seedMaterials } from "./materials";
import { seedOrderComments } from "./order-comments";
import { seedOrderStatusLogs } from "./order-status-logs";
import {
  NEXT_FOLIO_NUMBER,
  seedInvoiceData,
  seedOrderProducts,
  seedOrders,
} from "./orders";
import { seedPayments } from "./payments";
import { seedProducts } from "./products";
import { seedServices } from "./services";
import { seedUsers } from "./users";
import type {
  BladeType,
  CashMovement,
  Customer,
  InvoiceData,
  InvoiceStatus,
  Material,
  MovementType,
  Order,
  OrderComment,
  OrderProduct,
  OrderStatus,
  OrderStatusLog,
  Payment,
  PaymentMethod,
  PaymentType,
  Product,
  ReglasStatus,
  Service,
  User,
} from "./types";
import { canTransition, computeOrderAmounts, PAYMENT_TYPE_LABELS } from "./types";

// ---------------------------------------------------------------------------
// Pure helpers (also useful in components)
// ---------------------------------------------------------------------------

let idSeq = 0;
function genId(prefix: string): string {
  idSeq += 1;
  return `${prefix}-x${idSeq}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getOrderProducts(
  orderProducts: OrderProduct[],
  orderId: string,
): OrderProduct[] {
  return orderProducts.filter((op) => op.orderId === orderId);
}

export function getOrderPayments(
  payments: Payment[],
  orderId: string,
): Payment[] {
  return payments
    .filter((p) => p.orderId === orderId)
    .sort((a, b) => a.paidAt.localeCompare(b.paidAt));
}

/** Grand total to collect: service total (with IVA) + regletas. */
export function getOrderGrandTotal(
  order: Order,
  orderProducts: OrderProduct[],
): number {
  const productsTotal = getOrderProducts(orderProducts, order.id).reduce(
    (sum, op) => sum + op.subtotal,
    0,
  );
  return order.total + productsTotal;
}

export function getOrderPaidAmount(
  payments: Payment[],
  orderId: string,
): number {
  return getOrderPayments(payments, orderId).reduce(
    (sum, p) => sum + p.amount,
    0,
  );
}

export function getOrderBalance(
  order: Order,
  orderProducts: OrderProduct[],
  payments: Payment[],
): number {
  return (
    getOrderGrandTotal(order, orderProducts) -
    getOrderPaidAmount(payments, order.id)
  );
}

export function getCashBalance(
  movements: CashMovement[],
  method?: PaymentMethod,
): number {
  return movements
    .filter((m) => (method ? m.method === method : true))
    .reduce((sum, m) => sum + (m.type === "IN" ? m.amount : -m.amount), 0);
}

export function isLowStock(material: Material): boolean {
  return material.stock <= material.minStock;
}

// ---------------------------------------------------------------------------
// Action input types
// ---------------------------------------------------------------------------

export interface NewOrderProductInput {
  productId: string;
  quantity: number;
  status: ReglasStatus;
}

export interface NewOrderInvoiceInput {
  rfc: string;
  razonSocial: string;
  cfdiUse: string;
  fiscalAddress?: string;
}

export interface CreateOrderInput {
  customerId?: string;
  newCustomer?: { name: string; phone: string; email?: string };
  bladeTypeId: string;
  serviceId: string;
  quotedPrice: number;
  requiresInvoice: boolean;
  invoice?: NewOrderInvoiceInput;
  products: NewOrderProductInput[];
  droppedOffBy: string;
  estimatedDelivery: string;
  notes?: string;
}

export interface AddPaymentInput {
  type: PaymentType;
  method: PaymentMethod;
  amount: number;
}

export interface AddCashMovementInput {
  type: MovementType;
  concept: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
}

type ActionResult = { ok: true } | { ok: false; error: string };

interface MockDataStore {
  // collections
  users: User[];
  customers: Customer[];
  bladeTypes: BladeType[];
  services: Service[];
  products: Product[];
  materials: Material[];
  orders: Order[];
  orderProducts: OrderProduct[];
  invoiceData: InvoiceData[];
  payments: Payment[];
  cashMovements: CashMovement[];
  orderComments: OrderComment[];
  orderStatusLogs: OrderStatusLog[];

  // session
  currentUser: User;
  isSuperadmin: boolean;
  setCurrentUserId: (id: string) => void;

  // customers
  createCustomer: (input: {
    name: string;
    phone: string;
    email?: string;
  }) => Customer;
  updateCustomer: (
    id: string,
    patch: Partial<Pick<Customer, "name" | "phone" | "email">>,
  ) => void;
  deleteCustomer: (id: string) => ActionResult;

  // catalog
  createBladeType: (input: { name: string; description?: string }) => void;
  updateBladeType: (
    id: string,
    patch: Partial<Pick<BladeType, "name" | "description" | "active">>,
  ) => void;
  deleteBladeType: (id: string) => ActionResult;
  createService: (input: {
    name: string;
    description?: string;
    basePrice: number;
    bladeTypeId: string;
  }) => void;
  updateService: (
    id: string,
    patch: Partial<
      Pick<Service, "name" | "description" | "basePrice" | "active">
    >,
  ) => void;
  deleteService: (id: string) => ActionResult;

  // inventory
  createProduct: (input: {
    name: string;
    description?: string;
    price: number;
    stock: number;
  }) => void;
  updateProduct: (
    id: string,
    patch: Partial<
      Pick<Product, "name" | "description" | "price" | "stock" | "active">
    >,
  ) => void;
  deleteProduct: (id: string) => ActionResult;
  createMaterial: (input: {
    name: string;
    unit: string;
    stock: number;
    minStock: number;
  }) => void;
  updateMaterial: (
    id: string,
    patch: Partial<
      Pick<Material, "name" | "unit" | "stock" | "minStock" | "active">
    >,
  ) => void;
  deleteMaterial: (id: string) => void;

  // users
  createUser: (input: {
    email: string;
    fullName: string;
    role: User["role"];
  }) => void;
  updateUser: (
    id: string,
    patch: Partial<Pick<User, "email" | "fullName" | "role">>,
  ) => void;
  deleteUser: (id: string) => ActionResult;

  // orders
  createOrder: (input: CreateOrderInput) => Order;
  updateOrderStatus: (
    orderId: string,
    newStatus: OrderStatus,
    opts?: { pickedUpBy?: string; pickedUpPhone?: string },
  ) => ActionResult;
  addPayment: (orderId: string, input: AddPaymentInput) => ActionResult;
  addOrderComment: (orderId: string, content: string) => void;
  setInvoiceStatus: (orderId: string, status: InvoiceStatus) => void;

  // caja
  addCashMovement: (input: AddCashMovementInput) => void;
}

const MockDataContext = createContext<MockDataStore | null>(null);

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [currentUserId, setCurrentUserId] = useState<string>(seedUsers[0].id);
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);
  const [bladeTypes, setBladeTypes] = useState<BladeType[]>(seedBladeTypes);
  const [services, setServices] = useState<Service[]>(seedServices);
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [materials, setMaterials] = useState<Material[]>(seedMaterials);
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [orderProducts, setOrderProducts] =
    useState<OrderProduct[]>(seedOrderProducts);
  const [invoiceData, setInvoiceData] =
    useState<InvoiceData[]>(seedInvoiceData);
  const [payments, setPayments] = useState<Payment[]>(seedPayments);
  const [cashMovements, setCashMovements] =
    useState<CashMovement[]>(seedCashMovements);
  const [orderComments, setOrderComments] =
    useState<OrderComment[]>(seedOrderComments);
  const [orderStatusLogs, setOrderStatusLogs] = useState<OrderStatusLog[]>(
    seedOrderStatusLogs,
  );

  const folioCounter = useRef(NEXT_FOLIO_NUMBER);

  const currentUser =
    users.find((u) => u.id === currentUserId) ?? users[0];

  // ----- customers -----

  const createCustomer = useCallback(
    (input: { name: string; phone: string; email?: string }): Customer => {
      const customer: Customer = {
        id: genId("cust"),
        name: input.name,
        phone: input.phone,
        email: input.email?.trim() ? input.email.trim() : null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      setCustomers((prev) => [...prev, customer]);
      return customer;
    },
    [],
  );

  const updateCustomer = useCallback(
    (
      id: string,
      patch: Partial<Pick<Customer, "name" | "phone" | "email">>,
    ) => {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, ...patch, updatedAt: nowIso() } : c,
        ),
      );
    },
    [],
  );

  const deleteCustomer = useCallback(
    (id: string): ActionResult => {
      if (orders.some((o) => o.customerId === id)) {
        return {
          ok: false,
          error: "No se puede eliminar: el cliente tiene órdenes registradas.",
        };
      }
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      return { ok: true };
    },
    [orders],
  );

  // ----- catalog -----

  const createBladeType = useCallback(
    (input: { name: string; description?: string }) => {
      setBladeTypes((prev) => [
        ...prev,
        {
          id: genId("blade"),
          name: input.name,
          description: input.description?.trim() || null,
          active: true,
          createdAt: nowIso(),
        },
      ]);
    },
    [],
  );

  const updateBladeType = useCallback(
    (
      id: string,
      patch: Partial<Pick<BladeType, "name" | "description" | "active">>,
    ) => {
      setBladeTypes((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      );
    },
    [],
  );

  const deleteBladeType = useCallback(
    (id: string): ActionResult => {
      if (orders.some((o) => o.bladeTypeId === id)) {
        return {
          ok: false,
          error: "No se puede eliminar: hay órdenes con este tipo de cuchilla.",
        };
      }
      setServices((prev) => prev.filter((s) => s.bladeTypeId !== id));
      setBladeTypes((prev) => prev.filter((b) => b.id !== id));
      return { ok: true };
    },
    [orders],
  );

  const createService = useCallback(
    (input: {
      name: string;
      description?: string;
      basePrice: number;
      bladeTypeId: string;
    }) => {
      setServices((prev) => [
        ...prev,
        {
          id: genId("serv"),
          name: input.name,
          description: input.description?.trim() || null,
          basePrice: input.basePrice,
          active: true,
          createdAt: nowIso(),
          bladeTypeId: input.bladeTypeId,
        },
      ]);
    },
    [],
  );

  const updateService = useCallback(
    (
      id: string,
      patch: Partial<
        Pick<Service, "name" | "description" | "basePrice" | "active">
      >,
    ) => {
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      );
    },
    [],
  );

  const deleteService = useCallback(
    (id: string): ActionResult => {
      if (orders.some((o) => o.serviceId === id)) {
        return {
          ok: false,
          error: "No se puede eliminar: hay órdenes con este servicio.",
        };
      }
      setServices((prev) => prev.filter((s) => s.id !== id));
      return { ok: true };
    },
    [orders],
  );

  // ----- inventory -----

  const createProduct = useCallback(
    (input: {
      name: string;
      description?: string;
      price: number;
      stock: number;
    }) => {
      setProducts((prev) => [
        ...prev,
        {
          id: genId("prod"),
          name: input.name,
          description: input.description?.trim() || null,
          price: input.price,
          stock: input.stock,
          active: true,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      ]);
    },
    [],
  );

  const updateProduct = useCallback(
    (
      id: string,
      patch: Partial<
        Pick<Product, "name" | "description" | "price" | "stock" | "active">
      >,
    ) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...patch, updatedAt: nowIso() } : p,
        ),
      );
    },
    [],
  );

  const deleteProduct = useCallback(
    (id: string): ActionResult => {
      if (orderProducts.some((op) => op.productId === id)) {
        return {
          ok: false,
          error: "No se puede eliminar: hay órdenes con esta regleta.",
        };
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return { ok: true };
    },
    [orderProducts],
  );

  const createMaterial = useCallback(
    (input: { name: string; unit: string; stock: number; minStock: number }) => {
      setMaterials((prev) => [
        ...prev,
        {
          id: genId("mat"),
          name: input.name,
          unit: input.unit,
          stock: input.stock,
          minStock: input.minStock,
          active: true,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      ]);
    },
    [],
  );

  const updateMaterial = useCallback(
    (
      id: string,
      patch: Partial<
        Pick<Material, "name" | "unit" | "stock" | "minStock" | "active">
      >,
    ) => {
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, ...patch, updatedAt: nowIso() } : m,
        ),
      );
    },
    [],
  );

  const deleteMaterial = useCallback((id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // ----- users -----

  const createUser = useCallback(
    (input: { email: string; fullName: string; role: User["role"] }) => {
      setUsers((prev) => [
        ...prev,
        { id: genId("user"), ...input, createdAt: nowIso() },
      ]);
    },
    [],
  );

  const updateUser = useCallback(
    (
      id: string,
      patch: Partial<Pick<User, "email" | "fullName" | "role">>,
    ) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...patch } : u)),
      );
    },
    [],
  );

  const deleteUser = useCallback(
    (id: string): ActionResult => {
      if (id === currentUserId) {
        return { ok: false, error: "No puedes eliminar tu propio usuario." };
      }
      const references =
        orders.some((o) => o.receivedById === id || o.updatedById === id) ||
        payments.some((p) => p.registeredById === id) ||
        cashMovements.some((m) => m.registeredById === id);
      if (references) {
        return {
          ok: false,
          error: "No se puede eliminar: el usuario tiene actividad registrada.",
        };
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
      return { ok: true };
    },
    [currentUserId, orders, payments, cashMovements],
  );

  // ----- orders -----

  const addStatusLog = useCallback(
    (orderId: string, prevStatus: OrderStatus, newStatus: OrderStatus) => {
      setOrderStatusLogs((prev) => [
        ...prev,
        {
          id: genId("log"),
          prevStatus,
          newStatus,
          changedAt: nowIso(),
          orderId,
          changedById: currentUserId,
        },
      ]);
    },
    [currentUserId],
  );

  const createOrder = useCallback(
    (input: CreateOrderInput): Order => {
      let customerId = input.customerId;
      if (!customerId && input.newCustomer) {
        customerId = createCustomer(input.newCustomer).id;
      }
      if (!customerId) throw new Error("Order requires a customer");

      const folio = `FG-${String(folioCounter.current).padStart(5, "0")}`;
      folioCounter.current += 1;

      const amounts = computeOrderAmounts(
        input.quotedPrice,
        input.requiresInvoice,
      );
      const order: Order = {
        id: genId("order"),
        folio,
        status: "RECEIVED",
        customerId,
        bladeTypeId: input.bladeTypeId,
        serviceId: input.serviceId,
        quotedPrice: input.quotedPrice,
        ...amounts,
        advancePaid: false,
        advancePaidAt: null,
        estimatedDelivery: input.estimatedDelivery,
        deliveredAt: null,
        droppedOffBy: input.droppedOffBy,
        pickedUpBy: null,
        pickedUpPhone: null,
        receivedById: currentUserId,
        updatedById: null,
        requiresInvoice: input.requiresInvoice,
        invoiceStatus: input.requiresInvoice ? "PENDING" : "NOT_REQUIRED",
        notes: input.notes?.trim() || null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      setOrders((prev) => [...prev, order]);

      if (input.products.length > 0) {
        const newOrderProducts: OrderProduct[] = [];
        for (const item of input.products) {
          const product = products.find((p) => p.id === item.productId);
          if (!product || item.quantity <= 0) continue;
          newOrderProducts.push({
            id: genId("oprod"),
            quantity: item.quantity,
            unitPrice: product.price,
            subtotal: product.price * item.quantity,
            status: item.status,
            orderId: order.id,
            productId: product.id,
          });
        }
        setOrderProducts((prev) => [...prev, ...newOrderProducts]);
        // Selling regletas discounts inventory.
        setProducts((prev) =>
          prev.map((p) => {
            const sold = newOrderProducts.find((op) => op.productId === p.id);
            return sold
              ? {
                  ...p,
                  stock: Math.max(0, p.stock - sold.quantity),
                  updatedAt: nowIso(),
                }
              : p;
          }),
        );
      }

      if (input.requiresInvoice && input.invoice) {
        setInvoiceData((prev) => [
          ...prev,
          {
            id: genId("inv"),
            rfc: input.invoice!.rfc.toUpperCase(),
            razonSocial: input.invoice!.razonSocial,
            cfdiUse: input.invoice!.cfdiUse,
            fiscalAddress: input.invoice!.fiscalAddress?.trim() || null,
            evidenceUrl: null,
            orderId: order.id,
            createdAt: nowIso(),
            updatedAt: nowIso(),
          },
        ]);
      }

      return order;
    },
    [createCustomer, currentUserId, products],
  );

  const updateOrderStatus = useCallback(
    (
      orderId: string,
      newStatus: OrderStatus,
      opts?: { pickedUpBy?: string; pickedUpPhone?: string },
    ): ActionResult => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return { ok: false, error: "Orden no encontrada." };
      if (!canTransition(order.status, newStatus)) {
        return {
          ok: false,
          error: `Transición no permitida: ${order.status} → ${newStatus}.`,
        };
      }
      if (newStatus === "IN_PROGRESS" && !order.advancePaid) {
        return {
          ok: false,
          error:
            "No se puede iniciar el trabajo sin registrar el anticipo (50%).",
        };
      }
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: newStatus,
                deliveredAt:
                  newStatus === "DELIVERED" ? nowIso() : o.deliveredAt,
                pickedUpBy:
                  newStatus === "DELIVERED"
                    ? (opts?.pickedUpBy ?? o.droppedOffBy)
                    : o.pickedUpBy,
                pickedUpPhone:
                  newStatus === "DELIVERED"
                    ? (opts?.pickedUpPhone?.trim() || null)
                    : o.pickedUpPhone,
                updatedById: currentUserId,
                updatedAt: nowIso(),
              }
            : o,
        ),
      );
      addStatusLog(orderId, order.status, newStatus);
      return { ok: true };
    },
    [orders, currentUserId, addStatusLog],
  );

  const addPayment = useCallback(
    (orderId: string, input: AddPaymentInput): ActionResult => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return { ok: false, error: "Orden no encontrada." };
      if (input.amount <= 0) {
        return { ok: false, error: "El monto debe ser mayor a cero." };
      }

      const paidAt = nowIso();
      setPayments((prev) => [
        ...prev,
        {
          id: genId("pay"),
          type: input.type,
          method: input.method,
          amount: input.amount,
          voucherUrl: null,
          paidAt,
          orderId,
          registeredById: currentUserId,
        },
      ]);

      // Cash register sync (business rule): every payment creates an IN.
      setCashMovements((prev) => [
        ...prev,
        {
          id: genId("mov"),
          type: "IN",
          concept: `${PAYMENT_TYPE_LABELS[input.type]} orden ${order.folio}`,
          amount: input.amount,
          method: input.method,
          referenceId: orderId,
          referenceType: "order",
          notes: null,
          createdAt: paidAt,
          registeredById: currentUserId,
        },
      ]);

      if (input.type === "ADVANCE") {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  advancePaid: true,
                  advancePaidAt: paidAt,
                  updatedById: currentUserId,
                  updatedAt: paidAt,
                }
              : o,
          ),
        );
        // Advance registered → work can start.
        if (order.status === "PENDING_ADVANCE") {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === orderId ? { ...o, status: "IN_PROGRESS" } : o,
            ),
          );
          addStatusLog(orderId, "PENDING_ADVANCE", "IN_PROGRESS");
        }
      }
      return { ok: true };
    },
    [orders, currentUserId, addStatusLog],
  );

  const addOrderComment = useCallback(
    (orderId: string, content: string) => {
      setOrderComments((prev) => [
        ...prev,
        {
          id: genId("com"),
          content,
          createdAt: nowIso(),
          orderId,
          authorId: currentUserId,
        },
      ]);
    },
    [currentUserId],
  );

  const setInvoiceStatus = useCallback(
    (orderId: string, status: InvoiceStatus) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                invoiceStatus: status,
                updatedById: currentUserId,
                updatedAt: nowIso(),
              }
            : o,
        ),
      );
    },
    [currentUserId],
  );

  // ----- caja -----

  const addCashMovement = useCallback(
    (input: AddCashMovementInput) => {
      setCashMovements((prev) => [
        ...prev,
        {
          id: genId("mov"),
          type: input.type,
          concept: input.concept,
          amount: input.amount,
          method: input.method,
          referenceId: null,
          referenceType: input.type === "OUT" ? "expense" : null,
          notes: input.notes?.trim() || null,
          createdAt: nowIso(),
          registeredById: currentUserId,
        },
      ]);
    },
    [currentUserId],
  );

  const value = useMemo<MockDataStore>(
    () => ({
      users,
      customers,
      bladeTypes,
      services,
      products,
      materials,
      orders,
      orderProducts,
      invoiceData,
      payments,
      cashMovements,
      orderComments,
      orderStatusLogs,
      currentUser,
      isSuperadmin: currentUser.role === "SUPERADMIN",
      setCurrentUserId,
      createCustomer,
      updateCustomer,
      deleteCustomer,
      createBladeType,
      updateBladeType,
      deleteBladeType,
      createService,
      updateService,
      deleteService,
      createProduct,
      updateProduct,
      deleteProduct,
      createMaterial,
      updateMaterial,
      deleteMaterial,
      createUser,
      updateUser,
      deleteUser,
      createOrder,
      updateOrderStatus,
      addPayment,
      addOrderComment,
      setInvoiceStatus,
      addCashMovement,
    }),
    [
      users,
      customers,
      bladeTypes,
      services,
      products,
      materials,
      orders,
      orderProducts,
      invoiceData,
      payments,
      cashMovements,
      orderComments,
      orderStatusLogs,
      currentUser,
      createCustomer,
      updateCustomer,
      deleteCustomer,
      createBladeType,
      updateBladeType,
      deleteBladeType,
      createService,
      updateService,
      deleteService,
      createProduct,
      updateProduct,
      deleteProduct,
      createMaterial,
      updateMaterial,
      deleteMaterial,
      createUser,
      updateUser,
      deleteUser,
      createOrder,
      updateOrderStatus,
      addPayment,
      addOrderComment,
      setInvoiceStatus,
      addCashMovement,
    ],
  );

  return (
    <MockDataContext.Provider value={value}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData(): MockDataStore {
  const ctx = useContext(MockDataContext);
  if (!ctx) {
    throw new Error("useMockData must be used inside MockDataProvider");
  }
  return ctx;
}
