import { Router } from "express";
import { db } from "@workspace/db";
import { defectsTable } from "@workspace/db";
import { eq, gte, lte, and, sql } from "drizzle-orm";
import {
  CreateDefectBody,
  GetDefectParams,
  DeleteDefectParams,
  ListDefectsQueryParams,
  GetDefectStatsQueryParams,
  ExportDefectsExcelQueryParams,
} from "@workspace/api-zod";
import ExcelJS from "exceljs";

const router = Router();

const DEFECT_TYPE_LABELS: Record<string, string> = {
  arrugas: "Arrugas",
  pisados: "Pisados",
  codificado_cortado: "Codificado cortado",
  codificado_poco_legible: "Codificado poco legible",
  blisters_vacio: "Blisters vacío",
  blisters_ausencia_comprimido: "Blisters con ausencia de comprimido",
  blisters_comprimido_partido: "Blisters con comprimido partido",
  poco_segrinado: "Poco segrinado",
  polvo: "Polvo",
  manchas: "Manchas",
  pinchados: "Pinchados",
};

router.get("/defects", async (req, res) => {
  const parsed = ListDefectsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { fromDate, toDate, defectType } = parsed.data;

  const conditions = [];
  if (fromDate) {
    conditions.push(gte(defectsTable.createdAt, new Date(fromDate)));
  }
  if (toDate) {
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(defectsTable.createdAt, end));
  }
  if (defectType) {
    conditions.push(eq(defectsTable.defectType, defectType));
  }

  const defects = await db
    .select()
    .from(defectsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${defectsTable.createdAt} DESC`);

  const result = defects.map((d) => ({
    ...d,
    incidenceRate: parseFloat(d.incidenceRate),
    defectPhotoUrls: (d.defectPhotoUrls as string[]) ?? [],
  }));

  res.json(result);
});

router.post("/defects", async (req, res) => {
  const parsed = CreateDefectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.issues });
    return;
  }

  const data = parsed.data;
  const [created] = await db
    .insert(defectsTable)
    .values({
      opNumber: data.opNumber,
      bulkCode: data.bulkCode,
      product: data.product,
      lot: data.lot,
      orderQuantity: data.orderQuantity,
      blistersPerBox: data.blistersPerBox,
      totalBlisters: data.totalBlisters,
      defectiveBlisters: data.defectiveBlisters,
      incidenceRate: String(data.incidenceRate),
      defectType: data.defectType,
      labelPhotoUrl: data.labelPhotoUrl ?? null,
      defectPhotoUrls: data.defectPhotoUrls,
      observations: data.observations ?? null,
    })
    .returning();

  res.status(201).json({
    ...created,
    incidenceRate: parseFloat(created.incidenceRate),
    defectPhotoUrls: (created.defectPhotoUrls as string[]) ?? [],
  });
});

router.get("/defects/stats/summary", async (req, res) => {
  const parsed = GetDefectStatsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { fromDate, toDate } = parsed.data;

  const conditions = [];
  if (fromDate) {
    conditions.push(gte(defectsTable.createdAt, new Date(fromDate)));
  }
  if (toDate) {
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(defectsTable.createdAt, end));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const defects = await db
    .select()
    .from(defectsTable)
    .where(whereClause);

  const totalRecords = defects.length;
  const totalBlistersInspected = defects.reduce((s, d) => s + d.totalBlisters, 0);
  const totalDefective = defects.reduce((s, d) => s + d.defectiveBlisters, 0);
  const averageIncidenceRate =
    totalRecords > 0
      ? defects.reduce((s, d) => s + parseFloat(d.incidenceRate), 0) / totalRecords
      : 0;

  const byTypeMap: Record<string, { count: number; totalDefective: number }> = {};
  for (const d of defects) {
    if (!byTypeMap[d.defectType]) {
      byTypeMap[d.defectType] = { count: 0, totalDefective: 0 };
    }
    byTypeMap[d.defectType].count++;
    byTypeMap[d.defectType].totalDefective += d.defectiveBlisters;
  }
  const byType = Object.entries(byTypeMap).map(([defectType, v]) => ({
    defectType,
    ...v,
  }));

  const byDateMap: Record<string, { count: number; totalDefective: number }> = {};
  for (const d of defects) {
    const dateKey = d.createdAt.toISOString().slice(0, 10);
    if (!byDateMap[dateKey]) {
      byDateMap[dateKey] = { count: 0, totalDefective: 0 };
    }
    byDateMap[dateKey].count++;
    byDateMap[dateKey].totalDefective += d.defectiveBlisters;
  }
  const byDate = Object.entries(byDateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }));

  res.json({
    totalRecords,
    totalBlistersInspected,
    totalDefective,
    averageIncidenceRate,
    byType,
    byDate,
  });
});

router.get("/defects/export/excel", async (req, res) => {
  const parsed = ExportDefectsExcelQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { fromDate, toDate, defectType } = parsed.data;

  const conditions = [];
  if (fromDate) {
    conditions.push(gte(defectsTable.createdAt, new Date(fromDate)));
  }
  if (toDate) {
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(defectsTable.createdAt, end));
  }
  if (defectType) {
    conditions.push(eq(defectsTable.defectType, defectType));
  }

  const defects = await db
    .select()
    .from(defectsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${defectsTable.createdAt} DESC`);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Baliarda";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("Defectos de Blisters");

  sheet.columns = [
    { header: "ID", key: "id", width: 8 },
    { header: "Fecha", key: "createdAt", width: 20 },
    { header: "N° OP", key: "opNumber", width: 15 },
    { header: "Código Granel", key: "bulkCode", width: 18 },
    { header: "Producto", key: "product", width: 25 },
    { header: "Lote", key: "lot", width: 15 },
    { header: "Cant. Orden", key: "orderQuantity", width: 14 },
    { header: "Blisters por Estuche", key: "blistersPerBox", width: 20 },
    { header: "Total Blisters", key: "totalBlisters", width: 16 },
    { header: "Blisters Defectuosos", key: "defectiveBlisters", width: 22 },
    { header: "Incidencia (%)", key: "incidenceRate", width: 16 },
    { header: "Tipo de Defecto", key: "defectType", width: 30 },
    { header: "Observaciones", key: "observations", width: 35 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1B5E3B" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  for (const d of defects) {
    sheet.addRow({
      id: d.id,
      createdAt: d.createdAt.toLocaleString("es-AR"),
      opNumber: d.opNumber,
      bulkCode: d.bulkCode,
      product: d.product,
      lot: d.lot,
      orderQuantity: d.orderQuantity,
      blistersPerBox: d.blistersPerBox,
      totalBlisters: d.totalBlisters,
      defectiveBlisters: d.defectiveBlisters,
      incidenceRate: parseFloat(d.incidenceRate).toFixed(2),
      defectType: DEFECT_TYPE_LABELS[d.defectType] ?? d.defectType,
      observations: d.observations ?? "",
    });
  }

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="defectos-blisters-${new Date().toISOString().slice(0, 10)}.xlsx"`
  );

  await workbook.xlsx.write(res);
  res.end();
});

router.get("/defects/:id", async (req, res) => {
  const parsed = GetDefectParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [defect] = await db
    .select()
    .from(defectsTable)
    .where(eq(defectsTable.id, parsed.data.id));

  if (!defect) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json({
    ...defect,
    incidenceRate: parseFloat(defect.incidenceRate),
    defectPhotoUrls: (defect.defectPhotoUrls as string[]) ?? [],
  });
});

router.delete("/defects/:id", async (req, res) => {
  const parsed = DeleteDefectParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(defectsTable).where(eq(defectsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
