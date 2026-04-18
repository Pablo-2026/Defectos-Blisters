import { Layout } from "@/components/layout/layout";
import { useListDefects, useDeleteDefect } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFECT_TYPE_LABELS } from "@/lib/constants";
import { format } from "date-fns";
import { Download, Trash2, Pencil, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListDefectsQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";

export default function DefectsList() {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [defectType, setDefectType] = useState<string>("all");
  const [, setLocation] = useLocation();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryParams = {
    ...(fromDate && { fromDate }),
    ...(toDate && { toDate }),
    ...(defectType !== "all" && { defectType }),
  };

  const { data: defects, isLoading } = useListDefects(queryParams, {
    query: { queryKey: getListDefectsQueryKey(queryParams) }
  });

  const deleteDefect = useDeleteDefect();

  const handleDelete = (id: number) => {
    if (confirm("¿Está seguro que desea eliminar este registro?")) {
      deleteDefect.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Registro eliminado" });
          queryClient.invalidateQueries({ queryKey: getListDefectsQueryKey(queryParams) });
        }
      });
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);
    if (defectType !== "all") params.append("defectType", defectType);
    
    window.location.href = `/api/defects/export/excel?${params.toString()}`;
  };

  return (
    <Layout title="Defectos Observados" showBack>
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label>Desde</Label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Hasta</Label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Defecto</Label>
                <Select value={defectType} onValueChange={setDefectType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Object.entries(DEFECT_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button className="w-full" variant="secondary" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" /> Exportar Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !defects || defects.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-lg border">
            <p className="text-muted-foreground">No se encontraron registros de defectos.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {defects.map(defect => (
              <Card key={defect.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-4 flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <CalendarIcon className="h-4 w-4" />
                            {format(new Date(defect.createdAt), "dd/MM/yyyy HH:mm")}
                          </div>
                          {defect.defectItems && defect.defectItems.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {defect.defectItems.map((item) => (
                                <span key={item.type} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                                  {DEFECT_TYPE_LABELS[item.type] ?? item.type}
                                  <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs font-bold ml-1">{item.count}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <h3 className="font-bold text-lg">{DEFECT_TYPE_LABELS[defect.defectType] ?? defect.defectType}</h3>
                          )}
                        </div>
                        <div className="bg-destructive/10 text-destructive font-bold px-3 py-1 rounded-md whitespace-nowrap">
                          {defect.incidenceRate.toFixed(2)}%
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground block text-xs">OP</span>
                          <span className="font-medium">{defect.opNumber}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs">Producto</span>
                          <span className="font-medium">{defect.product}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs">Lote</span>
                          <span className="font-medium">{defect.lot}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs">Afectados</span>
                          <span className="font-medium text-destructive">{defect.defectiveBlisters} / {defect.totalBlisters}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted p-4 flex gap-4 md:w-64 border-t md:border-t-0 md:border-l items-center justify-between md:flex-col md:justify-center">
                      <div className="flex gap-2">
                        {defect.labelPhotoUrl && (
                          <div className="w-12 h-12 rounded overflow-hidden border bg-white">
                            <img src={defect.labelPhotoUrl} alt="Rótulo" className="w-full h-full object-cover" />
                          </div>
                        )}
                        {defect.defectPhotoUrls?.length > 0 && (
                          <div className="w-12 h-12 rounded overflow-hidden border bg-white relative">
                            <img src={defect.defectPhotoUrls[0]} alt="Defecto" className="w-full h-full object-cover" />
                            {defect.defectPhotoUrls.length > 1 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                                +{defect.defectPhotoUrls.length - 1}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 hover:text-primary" onClick={() => setLocation(`/cargar-defecto?id=${defect.id}`)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(defect.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
