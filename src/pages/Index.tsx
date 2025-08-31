import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Gallery from '@/components/Gallery';
import ContactForm from '@/components/ContactForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Clock, Star, Users, Award, CheckCircle, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useMemo, useState } from 'react';
import { settingsAPI } from '@/services/api';

export default function Index() {
  const [settings, setSettings] = useState<any | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await settingsAPI.get();
        setSettings(res?.data || res);
      } catch (e) {
        // Sessiz geç: ayarlar gelmese de varsayılan metinler gösterilir
        console.warn('Site settings alınamadı');
      }
    })();
  }, []);

  const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const copyPhone = async (display: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${display} kopyalandı`);
    } catch (e) {
      toast.error('Numara kopyalanamadı');
    }
  };

  const normalizeTel = (value: string) => {
    const digits = (value || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('90')) return `+${digits}`;
    if (digits.length === 11 && digits.startsWith('0')) return `+9${digits}`; // 0XXXXXXXXXX -> +90XXXXXXXXXX
    if (digits.length === 10) return `+90${digits}`;
    if (value.startsWith('+')) return value;
    return `+${digits}`;
  };

  const phones = useMemo(() => {
    if (!settings?.phone) return [] as { display: string; tel: string }[];
    const parts = String(settings.phone)
      .split(/[\n,;]+/)
      .map((s: string) => s.trim())
      .filter(Boolean);
    return parts.map((p: string) => ({ display: p, tel: normalizeTel(p) }));
  }, [settings]);

  const waLink = useMemo(() => {
    if (!phones.length) return '';
    const raw = phones[0].tel.replace(/\D/g, '');
    const waNum = raw.startsWith('90')
      ? raw
      : raw.startsWith('0') && raw.length === 11
        ? `9${raw}`
        : raw.length === 10
          ? `90${raw}`
          : raw;
    const waText = encodeURIComponent('Merhaba, Lila İlaçlama’dan hizmet almak istiyorum. Ücretsiz keşif randevusu alabilir miyim?');
    return `https://wa.me/${waNum}?text=${waText}`;
  }, [phones]);
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Services />
      <Gallery />

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                  Neden Lila İlaçlama?
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  15 yıllık deneyimimiz ve uzman kadromuzla, zararlı kontrolünde
                  sektörün öncü firmasıyız. Müşteri memnuniyeti odaklı yaklaşımımızla
                  binlerce başarılı projeye imza attık.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">15+</div>
                  <div className="text-gray-600">Yıl Deneyim</div>
                </div>
                <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">5000+</div>
                  <div className="text-gray-600">Mutlu Müşteri</div>
                </div>
                <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                  <div className="text-gray-600">Destek Hizmeti</div>
                </div>
                <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">%100</div>
                  <div className="text-gray-600">Garanti</div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle>Sertifikalı Uzmanlar</CardTitle>
                      <CardDescription>Lisanslı ve deneyimli teknik ekip</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <CheckCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle>Kalite Garantisi</CardTitle>
                      <CardDescription>İşçilik ve malzeme garantisi</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle>Müşteri Odaklı</CardTitle>
                      <CardDescription>7/24 müşteri destek hizmeti</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              İletişime Geçin
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Profesyonel ilaçlama hizmetleri için bizimle iletişime geçin.
              Ücretsiz keşif ve danışmanlık hizmeti sunuyoruz.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-600 p-3 rounded-full">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Telefon</h3>
                  {phones.length === 0 ? (
                    <p className="text-gray-400">Telefon bilgisi yakında</p>
                  ) : (
                    phones.map((p, i) => (
                      <p key={i}>
                        <a
                          href={`tel:${p.tel}`}
                          className="text-gray-300 hover:text-white underline-offset-4 hover:underline"
                          onClick={(e) => {
                            if (!isMobile) { e.preventDefault(); copyPhone(p.display, p.tel); }
                          }}
                        >
                          {p.display}
                        </a>
                      </p>
                    ))
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 rounded-md text-white"
                        style={{ backgroundColor: '#25D366' }}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp ile yaz
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-600 p-3 rounded-full">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">E-posta</h3>
                  {settings?.email ? (
                    String(settings.email)
                      .split(/[\n,;]+/)
                      .map((e: string) => e.trim())
                      .filter(Boolean)
                      .map((e: string, i: number) => (
                        <p key={i}>
                          <a href={`mailto:${e}`} className="text-gray-300 hover:text-white underline-offset-4 hover:underline">{e}</a>
                        </p>
                      ))
                  ) : (
                    <p className="text-gray-400">E-posta bilgisi yakında</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-600 p-3 rounded-full">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Adres</h3>
                  <p className="text-gray-300">
                    {settings?.address ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white underline-offset-4 hover:underline"
                      >
                        {settings.address}
                      </a>
                    ) : (
                      <span className="text-gray-400">Adres bilgisi yakında</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-600 p-3 rounded-full">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Çalışma Saatleri</h3>
                  <p className="text-gray-300">Pazartesi - Cumartesi: 08:00 - 18:00</p>
                  <p className="text-gray-300">Pazar: Acil durumlar için 24/7</p>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 rounded-2xl">
                <div className="flex items-center justify-center space-x-6">
                  <div className="text-center">
                    <Star className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
                    <div className="text-sm">5.0 Puan</div>
                  </div>
                  <div className="text-center">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm">Garantili</div>
                  </div>
                  <div className="text-center">
                    <Award className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm">Sertifikalı</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-purple-400 mb-4">Lila İlaçlama</h3>
            <p className="text-gray-400 mb-4">
              Profesyonel ilaçlama hizmetleri ile sağlıklı yaşam alanları
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 Lila İlaçlama. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}