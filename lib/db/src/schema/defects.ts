import { pgTable, text, serial, integer, numeric, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const defectTypeEnum = [
  "arrugas",
  "pisados",
  "codificado_cortado",
  "codificado_poco_legible",
  "blisters_vacio",
  "blisters_ausencia_comprimido",
  "blisters_comprimido_partido",
  "poco_segrinado",
  "polvo",
  "manchas",
  "pinchados",
  "comprimido_con_pelo",
] as const;

export type DefectItem = { type: string; count: number };

export const defectsTable = pgTable("defects", {
  id: serial("id").primaryKey(),
  opNumber: text("op_number").notNull(),
  bulkCode: text("bulk_code").notNull(),
  product: text("product").notNull(),
  lot: text("lot").notNull(),
  orderQuantity: integer("order_quantity").notNull(),
  blistersPerBox: integer("blisters_per_box").notNull(),
  totalBlisters: integer("total_blisters").notNull(),
  defectiveBlisters: integer("defective_blisters").notNull(),
  incidenceRate: numeric("incidence_rate", { precision: 10, scale: 4 }).notNull(),
  defectType: text("defect_type").notNull(),
  defectItems: jsonb("defect_items").$type<DefectItem[]>().notNull().default([]),
  labelPhotoUrl: text("label_photo_url"),
  defectPhotoUrls: jsonb("defect_photo_urls").$type<string[]>().notNull().default([]),
  observations: text("observations"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDefectSchema = createInsertSchema(defectsTable).omit({ id: true, createdAt: true });
export type InsertDefect = z.infer<typeof insertDefectSchema>;
export type Defect = typeof defectsTable.$inferSelect;
