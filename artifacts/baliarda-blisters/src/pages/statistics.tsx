import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useGetDefectStats, getGetDefectStatsQueryKey } from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DEFECT_TYPE_LABELS } from "@/lib/constants";
import { Loader2 } from "lucide-react";

export default function Statistics() {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const queryParams = {
    ...(fromDate && { fromDate }),
    ...(toDate && { toDate }),
  };

  const { data: stats, isLoading } = useGetDefectStats(queryParams, {
    query: { queryKey: getGetDefectStatsQueryKey(queryParams) }
  });

  const barChartData = stats?.byType.map(item => ({
    name: DEFECT_TYPE_LABELS[item.defectType] || item.defectType,
    cantidad: item.count,
    afectados: item.totalDefective
  })) || [];

  const lineChartData = stats?.byDate.map(item => ({
    fecha: item.date,
    cantidad: item.count
  })) || [];

  return (
    <Layout title="Estadísticas" showBack>
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="space-y-2 flex-1">
                <Label>Desde</Label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="space-y-2 flex-1">
                <Label>Hasta</Label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground">Registros Totales</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalRecords}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground">Blisters Inspeccionados</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalBlistersInspected.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground">Blisters Defectuosos</p>
                  <p className="text-3xl font-bold mt-2 text-destructive">{stats.totalDefective.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground">Incidencia Promedio</p>
                  <p className="text-3xl font-bold mt-2 text-primary">{stats.averageIncidenceRate.toFixed(2)}%</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Defectos por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    {barChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} fontSize={12} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="cantidad" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">Sin datos</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Registros por Fecha</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    {lineChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="fecha" fontSize={12} />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="cantidad" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">Sin datos</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </Layout>
  );
}
