import { Link } from "wouter";
import { PlusCircle, List, BarChart3, ChevronRight } from "lucide-react";
import logoUrl from "@assets/file_000000008c8871f5a10918cd8aa9d2d1_1776431120876.png";

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: "hsl(149, 55%, 18%)" }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-10 pb-4">
        <img
          src={logoUrl}
          alt="Baliarda"
          className="w-full max-w-xs sm:max-w-sm object-contain drop-shadow-xl mb-6"
        />
        <h1 className="text-white text-2xl sm:text-3xl font-bold text-center tracking-tight leading-tight">
          Control de Defectos<br />de Blisters
        </h1>
        <p className="text-white/60 text-sm text-center mt-2">
          Portal de Calidad y Producción
        </p>
      </div>

      <div className="w-full px-4 pb-10 space-y-3 max-w-md mx-auto">
        <Link href="/cargar-defecto">
          <button className="w-full bg-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-lg active:scale-[0.98] transition-transform">
            <div className="rounded-full p-2.5" style={{ background: "hsl(149, 55%, 18%)" }}>
              <PlusCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900 text-base">Cargar Defecto</p>
              <p className="text-sm text-gray-500">Registrar una nueva observación</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </Link>

        <Link href="/defectos-observados">
          <button className="w-full bg-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-lg active:scale-[0.98] transition-transform">
            <div className="rounded-full p-2.5" style={{ background: "hsl(149, 55%, 18%)" }}>
              <List className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900 text-base">Defectos Observados</p>
              <p className="text-sm text-gray-500">Ver y exportar registros</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </Link>

        <Link href="/estadisticas">
          <button className="w-full bg-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-lg active:scale-[0.98] transition-transform">
            <div className="rounded-full p-2.5" style={{ background: "hsl(149, 55%, 18%)" }}>
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900 text-base">Estadísticas</p>
              <p className="text-sm text-gray-500">Métricas y análisis</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </Link>
      </div>
    </div>
  );
}
