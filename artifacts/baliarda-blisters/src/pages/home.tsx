import { Link } from "wouter";
import { PlusCircle, List, BarChart3, ChevronRight } from "lucide-react";
import logoUrl from "@assets/file_000000008c8871f5a10918cd8aa9d2d1_1776431120876.png";

const menuItems = [
  {
    href: "/cargar-defecto",
    icon: PlusCircle,
    label: "Cargar Defecto",
    description: "Registrar una nueva observación de defecto en producción",
    glowColor: "#00e5ff",
    borderColor: "rgba(0,229,255,0.7)",
    shadowColor: "rgba(0,229,255,0.3)",
  },
  {
    href: "/defectos-observados",
    icon: List,
    label: "Defectos Observados",
    description: "Ver, filtrar y exportar todos los registros cargados",
    glowColor: "#bf5af2",
    borderColor: "rgba(191,90,242,0.7)",
    shadowColor: "rgba(191,90,242,0.3)",
  },
  {
    href: "/estadisticas",
    icon: BarChart3,
    label: "Estadísticas",
    description: "Gráficos y análisis de incidencia por tipo de defecto",
    glowColor: "#30d158",
    borderColor: "rgba(48,209,88,0.7)",
    shadowColor: "rgba(48,209,88,0.3)",
  },
];

export default function Home() {
  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-between px-5 py-8"
      style={{ background: "#1a1f2e" }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <img
          src={logoUrl}
          alt="Baliarda"
          className="w-36 h-36 object-cover rounded-3xl shadow-2xl"
          style={{ boxShadow: "0 0 40px rgba(48,209,88,0.25), 0 8px 32px rgba(0,0,0,0.5)" }}
        />

        <div className="text-center space-y-1">
          <h1
            className="text-white font-black tracking-widest uppercase text-xl sm:text-2xl"
            style={{ letterSpacing: "0.15em" }}
          >
            Control de Defectos
          </h1>
          <p className="text-white/50 text-sm tracking-widest uppercase" style={{ letterSpacing: "0.12em" }}>
            Laboratorio Baliarda
          </p>
        </div>

        <div className="w-full space-y-3 mt-2">
          {menuItems.map(({ href, icon: Icon, label, description, borderColor, shadowColor, glowColor }) => (
            <Link key={href} href={href}>
              <button
                className="w-full rounded-2xl px-4 py-4 flex items-center gap-4 transition-all duration-200 active:scale-[0.97]"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${borderColor}`,
                  boxShadow: `0 0 16px ${shadowColor}, inset 0 0 12px rgba(255,255,255,0.02)`,
                }}
              >
                <div
                  className="rounded-xl p-2.5 flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <Icon className="h-5 w-5" style={{ color: glowColor }} strokeWidth={1.8} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-white/45 text-xs mt-0.5 leading-snug">{description}</p>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: glowColor, opacity: 0.7 }} />
              </button>
            </Link>
          ))}
        </div>
      </div>

      <p
        className="text-white/20 text-xs tracking-widest uppercase mt-8"
        style={{ letterSpacing: "0.18em" }}
      >
        Sistema de Control de Calidad
      </p>
    </div>
  );
}
