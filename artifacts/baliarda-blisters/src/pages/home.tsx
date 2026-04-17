import { Link } from "wouter";
import { PlusCircle, List, BarChart3 } from "lucide-react";
import logoUrl from "@assets/file_000000008c8871f5a10918cd8aa9d2d1_1776431120876.png";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <img src={logoUrl} alt="Baliarda Logo" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center tracking-tight">
            Control de Defectos de Blisters
          </h1>
          <p className="text-gray-500 text-center text-sm">
            Portal de Calidad y Producción
          </p>
        </div>

        <div className="grid gap-4">
          <Link href="/cargar-defecto">
            <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer group cursor-pointer border-gray-200">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                  <PlusCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">Cargar Defecto</h3>
                  <p className="text-sm text-gray-500">Registrar una nueva observación</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/defectos-observados">
            <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer group border-gray-200">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                  <List className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">Defectos Observados</h3>
                  <p className="text-sm text-gray-500">Ver y exportar registros</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/estadisticas">
            <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer group border-gray-200">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">Estadísticas</h3>
                  <p className="text-sm text-gray-500">Métricas y análisis</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
