import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar({ onSearch }: { onSearch?: (q: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
        scrolled ? "bg-black/90 backdrop-blur-sm shadow-md" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-black text-primary tracking-tighter" data-testid="link-home">
              AN TOONS
            </Link>
            <div className="hidden md:flex items-center gap-4 text-sm font-medium">
              <Link href="/" className="text-white hover:text-gray-300 transition-colors">Home</Link>
              <Link href="/movies" className="text-gray-300 hover:text-white transition-colors">Movies</Link>
              <Link href="#" className="text-gray-300 hover:text-white transition-colors">New & Popular</Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            {onSearch && (
              <div className="relative group">
                <div className="flex items-center bg-black/40 border border-transparent group-hover:border-white/40 focus-within:border-white/80 rounded transition-all overflow-hidden w-64 h-9">
                  <Search className="w-4 h-4 ml-3 text-white/70" />
                  <input
                    type="text"
                    placeholder="Titles, people, genres"
                    className="bg-transparent border-none outline-none text-white text-sm px-3 w-full"
                    onChange={(e) => onSearch(e.target.value)}
                    data-testid="input-search"
                  />
                </div>
              </div>
            )}
            <Link href="/admin" className="text-sm font-medium text-gray-300 hover:text-white" data-testid="link-admin">Admin</Link>
          </div>
          
          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-lg absolute top-16 left-0 w-full p-4 border-t border-white/10">
          <div className="flex flex-col gap-4">
            {onSearch && (
              <input
                type="text"
                placeholder="Search..."
                className="bg-white/10 border border-white/20 rounded p-2 text-white outline-none focus:border-primary"
                onChange={(e) => onSearch(e.target.value)}
              />
            )}
            <Link href="/" className="text-white font-medium">Home</Link>
            <Link href="/admin" className="text-white font-medium">Admin</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
