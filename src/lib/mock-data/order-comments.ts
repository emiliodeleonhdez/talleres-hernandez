import type { OrderComment } from "./types";

export const seedOrderComments: OrderComment[] = [
  {
    id: "com-1",
    content:
      "La cuchilla llegó con dos despuntes profundos por una grapa. Se avisó al cliente que el rectificado completo era necesario.",
    createdAt: "2026-05-04T16:30:00.000Z",
    orderId: "order-1",
    authorId: "user-2",
  },
  {
    id: "com-2",
    content: "Rectificado terminado, queda al 100. Se envolvió en kraft doble.",
    createdAt: "2026-05-07T19:30:00.000Z",
    orderId: "order-1",
    authorId: "user-1",
  },
  {
    id: "com-3",
    content:
      "Rotor #4 con mella grande, se va a bajar 0.3 mm en todo el juego para emparejar.",
    createdAt: "2026-06-02T16:00:00.000Z",
    orderId: "order-6",
    authorId: "user-1",
  },
  {
    id: "com-4",
    content: "Cliente llamó para preguntar avance. Se le dijo que va a tiempo.",
    createdAt: "2026-06-08T17:10:00.000Z",
    orderId: "order-6",
    authorId: "user-2",
  },
  {
    id: "com-5",
    content: "Plato rectificado, el disco quedó plano. Pendiente asentado fino.",
    createdAt: "2026-06-09T18:00:00.000Z",
    orderId: "order-8",
    authorId: "user-3",
  },
  {
    id: "com-6",
    content: "Lista desde mediodía. Se le marcó a Doña Mary, pasa el sábado.",
    createdAt: "2026-06-11T18:30:00.000Z",
    orderId: "order-8",
    authorId: "user-2",
  },
  {
    id: "com-7",
    content:
      "Banda soldada y triscada. Probada en la sierra del taller, corta parejo.",
    createdAt: "2026-06-11T19:00:00.000Z",
    orderId: "order-10",
    authorId: "user-3",
  },
  {
    id: "com-8",
    content: "Sus 3 regletas quedaron separadas en el anaquel B.",
    createdAt: "2026-06-09T15:20:00.000Z",
    orderId: "order-12",
    authorId: "user-1",
  },
  {
    id: "com-9",
    content:
      "El señor pidió que le avisemos por WhatsApp cuando esté el anticipo registrado.",
    createdAt: "2026-06-10T17:45:00.000Z",
    orderId: "order-14",
    authorId: "user-2",
  },
];
