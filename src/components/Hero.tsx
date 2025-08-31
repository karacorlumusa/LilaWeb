import { Button } from '@/components/ui/button';
import { Shield, Phone, CheckCircle } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="relative bg-gradient-to-br from-purple-50 via-white to-purple-100 py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Profesyonel
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-800 block">
                  İlaçlama Hizmetleri
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Evinizi ve işyerinizi zararlılardan koruyoruz. Güvenilir, etkili ve çevre dostu çözümlerle
                sağlıklı yaşam alanları oluşturuyoruz.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-purple-600" />
                <span className="text-gray-700 font-medium">Lisanslı Uzmanlar</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-purple-600" />
                <span className="text-gray-700 font-medium">Çevre Dostu</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-purple-600" />
                <span className="text-gray-700 font-medium">7/24 Destek</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-purple-600" />
                <span className="text-gray-700 font-medium">Garanti Belgeli</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="tel:+902125550123" className="inline-block">
                <Button
                  asChild={false}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-8 py-4 text-lg"
                >
                  <span className="flex items-center"><Phone className="mr-2 h-5 w-5" />Hemen Ara</span>
                </Button>
              </a>
              <Button
                size="lg"
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-4 text-lg"
                onClick={() => {
                  const el = document.getElementById('contact');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Ücretsiz Keşif
              </Button>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-purple-200 to-purple-300 rounded-3xl p-8 shadow-2xl">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 rounded-full mx-auto w-24 h-24 flex items-center justify-center">
                      <Shield className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Güvenilir Koruma</h3>
                    <p className="text-gray-600">
                      Modern teknoloji ile etkili çözümler
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-purple-600 text-white p-4 rounded-full shadow-lg">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-full shadow-lg">
                <Phone className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-5">
        <div className="w-full h-full bg-gradient-to-l from-purple-600 to-transparent"></div>
      </div>
    </section>
  );
};

export default Hero;