import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-2 rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-purple-800">Lila İlaçlama</h1>
              <p className="text-sm text-purple-600">Profesyonel Hizmet</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Ana Sayfa
            </a>
            <a href="#services" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Hizmetlerimiz
            </a>
            <a href="#gallery" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Galeri
            </a>
            <a href="#about" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Hakkımızda
            </a>
            <a href="#contact" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              İletişim
            </a>
          </nav>

          {/* Admin Button & Mobile Menu Toggle */}
          <div className="flex items-center space-x-4">
            <Link to="/admin">
              <Button variant="outline" className="hidden md:flex border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white">
                Admin Paneli
              </Button>
            </Link>
            
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <a href="#home" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Ana Sayfa
              </a>
              <a href="#services" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Hizmetlerimiz
              </a>
              <a href="#gallery" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Galeri
              </a>
              <a href="#about" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Hakkımızda
              </a>
              <a href="#contact" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                İletişim
              </a>
              <Link to="/admin" className="pt-2 border-t">
                <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white">
                  Admin Paneli
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;