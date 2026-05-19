# FiloGes — Order Schema

> Complete data structure for an order (Orden) in FiloGes. This covers the database model, related entities, enums, and business rules.

---

## Order status flow

```
RECEIVED → PENDING_ADVANCE → IN_PROGRESS → READY → DELIVERED
                                                ↑
                                          CANCELLED (at any point)
```

---

## Enums

```prisma
enum OrderStatus {
  RECEIVED          // Recibida — blade received, no advance yet
  PENDING_ADVANCE   // Pendiente anticipo — waiting for 50% advance payment
  IN_PROGRESS       // En proceso — advance paid, work started
  READY             // Lista p/entrega — work done, waiting for pickup
  DELIVERED         // Entregada — blade picked up
  CANCELLED         // Cancelada
}

enum PaymentMethod {
  CASH              // Efectivo
  CARD              // Tarjeta
  TRANSFER          // Transferencia
}

enum PaymentType {
  ADVANCE           // Anticipo (50%)
  FINAL             // Liquidación (remaining balance)
}

enum InvoiceStatus {
  NOT_REQUIRED      // No requiere factura
  PENDING           // Requiere factura, pendiente de emisión
  ISSUED            // Factura emitida
  CANCELLED         // Factura cancelada
}

enum ReglasStatus {
  SEPARATED         // Separada — client picks up later
  WITH_BLADE        // Con la cuchilla — delivered together with blade
}
```

---

## Core tables

### Order

```prisma
model Order {
  id                  String        @id @default(uuid())
  folio               String        @unique              // e.g. "FG-00241", auto-generated

  // Status
  status              OrderStatus   @default(RECEIVED)

  // Relationships
  customerId          String
  customer            Customer      @relation(fields: [customerId], references: [id])

  bladeTypeId         String
  bladeType           BladeType     @relation(fields: [bladeTypeId], references: [id])

  serviceId           String
  service             Service       @relation(fields: [serviceId], references: [id])

  // Pricing
  quotedPrice         Decimal                           // base price from service catalog, editable
  subtotal            Decimal                           // quotedPrice (before IVA)
  ivaAmount           Decimal       @default(0)         // 16% if invoice required, else 0
  total               Decimal                           // subtotal + ivaAmount

  // Advance payment tracking
  advancePaid         Boolean       @default(false)
  advanceAmount       Decimal                           // always 50% of total
  advancePaidAt       DateTime?

  // Delivery
  estimatedDelivery   DateTime
  deliveredAt         DateTime?

  // People
  droppedOffBy        String                            // name of person who dropped off the blade
  pickedUpBy          String?                           // name of person who picked it up (filled on delivery)
  pickedUpPhone       String?                           // optional phone of pickup person

  receivedById        String
  receivedBy          User          @relation("ReceivedBy", fields: [receivedById], references: [id])

  updatedById         String?
  updatedBy           User?         @relation("UpdatedBy", fields: [updatedById], references: [id])

  // Invoice
  requiresInvoice     Boolean       @default(false)
  invoiceStatus       InvoiceStatus @default(NOT_REQUIRED)

  // Timestamps
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt

  // Relations
  invoiceData         InvoiceData?
  payments            Payment[]
  products            OrderProduct[]
  comments            OrderComment[]
  statusLogs          OrderStatusLog[]
  notes               String?
}
```

---

### Customer

```prisma
model Customer {
  id          String    @id @default(uuid())
  name        String
  phone       String
  email       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  orders      Order[]
}
```

---

### BladeType

```prisma
model BladeType {
  id          String    @id @default(uuid())
  name        String                          // e.g. "Cuchilla circular 300mm"
  description String?
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())

  services    Service[]
  orders      Order[]
}
```

---

### Service

```prisma
model Service {
  id          String    @id @default(uuid())
  name        String                          // e.g. "Afilado estándar"
  description String?
  basePrice   Decimal
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())

  bladeTypeId String
  bladeType   BladeType @relation(fields: [bladeTypeId], references: [id])

  orders      Order[]
}
```

---

### Payment

```prisma
model Payment {
  id              String        @id @default(uuid())
  type            PaymentType                         // ADVANCE or FINAL
  method          PaymentMethod
  amount          Decimal
  voucherUrl      String?                             // Supabase Storage URL
  paidAt          DateTime      @default(now())

  orderId         String
  order           Order         @relation(fields: [orderId], references: [id])

  registeredById  String
  registeredBy    User          @relation(fields: [registeredById], references: [id])
}
```

---

### InvoiceData

```prisma
model InvoiceData {
  id              String    @id @default(uuid())
  rfc             String                        // max 13 chars, uppercase
  razonSocial     String
  cfdiUse         String                        // e.g. "G03", "G01", "P01"
  fiscalAddress   String?
  evidenceUrl     String?                       // Supabase Storage URL (PDF/image)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  orderId         String    @unique
  order           Order     @relation(fields: [orderId], references: [id])
}
```

---

### OrderProduct (Regletas added to an order)

```prisma
model OrderProduct {
  id          String        @id @default(uuid())
  quantity    Int
  unitPrice   Decimal
  subtotal    Decimal       // quantity * unitPrice
  status      ReglasStatus  @default(SEPARATED)

  orderId     String
  order       Order         @relation(fields: [orderId], references: [id])

  productId   String
  product     Product       @relation(fields: [productId], references: [id])
}
```

---

### OrderComment (Blade history)

```prisma
model OrderComment {
  id        String    @id @default(uuid())
  content   String
  createdAt DateTime  @default(now())

  orderId   String
  order     Order     @relation(fields: [orderId], references: [id])

  authorId  String
  author    User      @relation(fields: [authorId], references: [id])
}
```

---

### OrderStatusLog (Audit trail)

```prisma
model OrderStatusLog {
  id          String      @id @default(uuid())
  prevStatus  OrderStatus
  newStatus   OrderStatus
  changedAt   DateTime    @default(now())

  orderId     String
  order       Order       @relation(fields: [orderId], references: [id])

  changedById String
  changedBy   User        @relation(fields: [changedById], references: [id])
}
```

---

## Supporting tables

### Product (Regletas — sellable inventory)

```prisma
model Product {
  id          String    @id @default(uuid())
  name        String
  description String?
  price       Decimal
  stock       Int       @default(0)
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  orderProducts OrderProduct[]
}
```

---

### Material (Internal workshop supplies)

```prisma
model Material {
  id          String    @id @default(uuid())
  name        String
  unit        String                    // e.g. "pieza", "litro", "kg", "metro"
  stock       Int       @default(0)
  minStock    Int       @default(0)    // triggers low-stock alert when stock <= minStock
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

---

### CashMovement (Caja)

```prisma
enum MovementType {
  IN    // Entrada
  OUT   // Salida
}

model CashMovement {
  id              String        @id @default(uuid())
  type            MovementType
  concept         String                              // e.g. "Anticipo orden #FG-00241"
  amount          Decimal
  method          PaymentMethod
  referenceId     String?                             // optional order id or free reference
  referenceType   String?                             // e.g. "order", "expense"
  notes           String?
  createdAt       DateTime      @default(now())

  registeredById  String
  registeredBy    User          @relation(fields: [registeredById], references: [id])
}
```

---

### User

```prisma
enum Role {
  SUPERADMIN
  OPERATOR
}

model User {
  id        String    @id @default(uuid())           // mirrors Supabase auth.users UUID
  email     String    @unique
  fullName  String
  role      Role      @default(OPERATOR)
  createdAt DateTime  @default(now())

  ordersReceived    Order[]          @relation("ReceivedBy")
  ordersUpdated     Order[]          @relation("UpdatedBy")
  payments          Payment[]
  cashMovements     CashMovement[]
  statusLogs        OrderStatusLog[]
  comments          OrderComment[]
}
```

---

## Business rules

### Folio generation

- Format: `FG-XXXXX` (e.g. `FG-00001`)
- Auto-incremented, zero-padded to 5 digits
- Generated server-side on order creation

### Advance payment (Anticipo)

- Always 50% of `total`
- `advanceAmount = total * 0.5`
- Order cannot move from `PENDING_ADVANCE` to `IN_PROGRESS` until a `Payment` of type `ADVANCE` exists
- Registering advance automatically creates a `CashMovement` of type `IN`

### IVA calculation

- Only applied when `requiresInvoice = true`
- `ivaAmount = subtotal * 0.16`
- `total = subtotal + ivaAmount`
- When `requiresInvoice = false`: `ivaAmount = 0`, `total = subtotal`

### Status transitions — allowed moves

| From                   | To              | Condition                              |
| ---------------------- | --------------- | -------------------------------------- |
| RECEIVED               | PENDING_ADVANCE | always allowed                         |
| PENDING_ADVANCE        | IN_PROGRESS     | advance payment registered             |
| IN_PROGRESS            | READY           | always allowed                         |
| READY                  | DELIVERED       | always allowed — triggers pickup modal |
| Any (except DELIVERED) | CANCELLED       | always allowed                         |

### Delivery modal

- Triggered when status changes to `DELIVERED`
- Captures `pickedUpBy` (name) and optionally `pickedUpPhone`
- Default value: `droppedOffBy` (pre-filled, editable)

### Cash register sync

Every payment registered on an order automatically creates a `CashMovement`:

- Type: `IN`
- Concept: auto-generated (e.g. `"Anticipo orden #FG-00241"`)
- Amount: payment amount
- Method: same as payment method
- ReferenceId: order id
- ReferenceType: `"order"`

### Blade history (comments)

- Any user can add comments to an order at any time
- Comments are append-only (no edit, no delete)
- UI shows 5 most recent; full list available via scrollable panel
