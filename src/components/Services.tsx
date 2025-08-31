import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bug, Home, Building, Leaf, Shield, Zap } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Bug,
      title: "Böcek Kontrolü",
      description: "Karınca, hamamböceği, sivrisinek ve diğer böceklere karşı etkili mücadele",
      features: ["Kalıcı çözüm", "Güvenli ilaçlar", "Uzman ekip"],
      image: "bg-gradient-to-br from-red-100 to-red-200"
    },
    {
      icon: Home,
      title: "Ev İlaçlaması",
      description: "Evinizi zararlılardan koruyacak kapsamlı ev ilaçlama hizmetleri",
      features: ["Aile dostu", "Evcil hayvan güvenli", "Uzun süreli etki"],
      image: "bg-gradient-to-br from-blue-100 to-blue-200"
    },
    {
      icon: Building,
      title: "İşyeri İlaçlaması",
      description: "Ofis, restoran, otel ve diğer ticari alanlar için profesyonel hizmet",
      features: ["İş akışını bozmaz", "HACCP uyumlu", "Düzenli takip"],
      image: "bg-gradient-to-br from-green-100 to-green-200"
    },
    {
      icon: Leaf,
      title: "Çevre Dostu Çözümler",
      description: "Doğaya saygılı, organik ve biyolojik ilaçlama yöntemleri",
      features: ["Organik ürünler", "Çevre dostu", "Sürdürülebilir"],
      image: "bg-gradient-to-br from-emerald-100 to-emerald-200"
    },
    {
      icon: Shield,
      title: "Koruyucu İlaçlama",
      description: "Zararlıların gelmesini önleyici koruyucu ilaçlama programları",
      features: ["Önleyici yaklaşım", "Düzenli kontrol", "Garanti kapsamı"],
      image: "bg-gradient-to-br from-purple-100 to-purple-200"
    },
    {
      icon: Zap,
      title: "Acil Müdahale",
      description: "7/24 acil durum ilaçlama hizmetleri ve hızlı çözümler",
      features: ["24 saat hizmet", "Hızlı müdahale", "Anında çözüm"],
      image: "bg-gradient-to-br from-orange-100 to-orange-200"
    }
  ];

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<any>(null);

  const openDetails = (svc: any) => { setActive(svc); setOpen(true); };
  const goContact = () => { const el = document.getElementById('contact'); if (el) el.scrollIntoView({ behavior: 'smooth' }); };

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Hizmetlerimiz
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Profesyonel ekibimiz ve modern teknolojilerimiz ile size en iyi hizmeti sunuyoruz.
            Her türlü zararlı kontrolü için güvenilir çözümler.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
              <CardHeader className="pb-4">
                <div className={`${service.image} p-6 rounded-2xl mb-4 group-hover:scale-105 transition-transform duration-300`}>
                  <service.icon className="h-12 w-12 text-gray-700 mx-auto" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 text-center">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-gray-600 text-center">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white group-hover:bg-purple-600 group-hover:text-white transition-colors"
                  onClick={() => openDetails(service)}
                >
                  Detayları Gör
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-3xl p-8 lg:p-12 text-center text-white">
          <h3 className="text-3xl lg:text-4xl font-bold mb-4">
            Özel İhtiyaçlarınız İçin Danışmanlık
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Uzman ekibimiz size özel çözümler geliştirmek için hazır.
            Ücretsiz keşif ve danışmanlık hizmeti alın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100" onClick={goContact}>
              Ücretsiz Keşif Talep Et
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border border-white text-white hover:bg-white hover:text-purple-700"
              onClick={goContact}
            >
              Fiyat Teklifi Al
            </Button>
          </div>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{active?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-700">{active?.description}</p>
            <ul className="list-disc pl-5 text-gray-600">
              {active?.features?.map((f: string, i: number) => (<li key={i}>{f}</li>))}
            </ul>
            <Button onClick={goContact} className="bg-purple-600 hover:bg-purple-700">Ücretsiz Keşif Talep Et</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Services;