import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Image as ImageIcon, Calendar, MapPin } from 'lucide-react';
import { mediaAPI, assetUrl } from '@/services/api';
import { toast } from 'sonner';

const Gallery = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await mediaAPI.getAll();
        const items = (res.data || res)?.map((m: any) => ({
          id: m.id,
          type: (m.type === 1 || m.type === 'Video') ? 'video' : 'image',
          title: m.title,
          category: m.category,
          date: (m.date && typeof m.date === 'string') ? m.date : new Date().toISOString(),
          location: m.location || '-',
          url: assetUrl(m.url),
          description: m.description || ''
        })) ?? [];
        setMediaItems(items);
      } catch (err: any) {
        toast.error(err.message || 'Galeri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categories = useMemo(() => ([
    { id: 'all', label: 'Tümü', count: mediaItems.length },
    { id: 'ev', label: 'Ev İlaçlama', count: mediaItems.filter(item => item.category === 'ev').length },
    { id: 'isyeri', label: 'İşyeri', count: mediaItems.filter(item => item.category === 'isyeri').length },
    { id: 'cevre', label: 'Çevre Dostu', count: mediaItems.filter(item => item.category === 'cevre').length }
  ]), [mediaItems]);

  const filteredByCategory = activeTab === 'all'
    ? mediaItems
    : mediaItems.filter(item => item.category === activeTab);
  const filteredItems = filteredByCategory.filter((i) =>
    (i.title || '').toLowerCase().includes(query.toLowerCase()) ||
    (i.description || '').toLowerCase().includes(query.toLowerCase()) ||
    (i.location || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Çalışma Galerisi
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Gerçekleştirdiğimiz ilaçlama projelerinden örnekler. Profesyonel yaklaşımımızı
            ve kaliteli hizmetimizi görsel olarak keşfedin.
          </p>
        </div>

        {/* Search + Category */}
        <div className="max-w-3xl mx-auto mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ara: başlık, açıklama veya konum"
            className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeTab === category.id ? "default" : "outline"}
              onClick={() => setActiveTab(category.id)}
              className={`${activeTab === category.id
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                } transition-all duration-300`}
            >
              {category.label}
              <Badge variant="secondary" className="ml-2 bg-white text-purple-600">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && (
            <div className="col-span-3 text-center text-gray-500">Yükleniyor...</div>
          )}
          {!loading && filteredItems.length === 0 && (
            <div className="col-span-3 text-center text-gray-500">Henüz içerik bulunamadı</div>
          )}
          {!loading && filteredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-lg hover:-translate-y-2">
              <div className="relative">
                {/* Thumbnail */}
                <div className={`h-48 flex items-center justify-center relative overflow-hidden bg-gray-100`}>
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Play className="h-10 w-10 text-purple-600" />
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-purple-600 underline mt-2">Videoyu aç</a>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-white text-purple-600">
                      {item.type === 'video' ? 'Video' : 'Fotoğraf'}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {item.description}
                  </p>

                  {/* Meta Information */}
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(item.date).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {item.location}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white group-hover:bg-purple-600 group-hover:text-white transition-colors"
                    onClick={() => {
                      window.open(item.url, '_blank', 'noopener');
                    }}
                  >
                    {item.type === 'video' ? 'Videoyu İzle' : 'Büyük Görüntüle'}
                  </Button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8"
          >
            Daha Fazla Göster
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Gallery;