import { ReactNode } from "react";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children, title, showBack }: { children: ReactNode, title?: string, showBack?: boolean }) {
  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBack && (
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </Link>
            )}
            <div className="font-semibold text-lg tracking-tight">
              {title || "Baliarda"}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
