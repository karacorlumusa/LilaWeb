import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Shield,
  Upload,
  Image as ImageIcon,
  Video,
  Edit,
  Trash2,
  Plus,
  LogOut,
  Home,
  Settings,
  BarChart3,
  Users
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { mediaAPI, settingsAPI, authAPI, assetUrl, contactAPI } from '@/services/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  const [newMedia, setNewMedia] = useState({
    title: '',
    category: 'ev',
    description: '',
    location: '',
    file: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [editing, setEditing] = useState<{ open: boolean; item: any | null }>({ open: false, item: null });
  const [editForm, setEditForm] = useState<any>({ title: '', category: 'ev', description: '', location: '', status: true });
  const [settingsForm, setSettingsForm] = useState<any>({ companyName: 'Lila İlaçlama', phone: '+90 (212) 555 0123', email: 'info@lilailacla.com', address: 'Atatürk Mahallesi, İlaçlama Sokak No:15, Kadıköy / İstanbul' });
  const [pwdForm, setPwdForm] = useState<any>({ current: '', next: '', next2: '' });

  const fetchMedia = async () => {
    try {
      const res = await mediaAPI.getAll();
      // map backend to UI shape
      const items = (res.data || res)?.map((m: any) => ({
        id: m.id,
        type: (m.type === 1 || m.type === 'Video') ? 'video' : 'image',
        title: m.title,
        category: m.category,
        date: (m.date && typeof m.date === 'string') ? m.date : new Date().toISOString(),
        status: (m.status === 0 || m.status === 'Active') ? 'active' : 'inactive',
        url: assetUrl(m.url),
        description: m.description || '',
        location: m.location || '',
      })) ?? [];
      setMediaItems(items);
    } catch (err: any) {
      toast.error(err.message || 'Medya listesi alınamadı');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMedia();
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await contactAPI.getAll();
      const items = (res.data || res)?.map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        service: c.service || 'genel',
        message: c.message,
        status: typeof c.status === 'string' ? c.status : (c.status === 0 ? 'New' : c.status === 1 ? 'Contacted' : 'Completed'),
        createdAt: c.createdAt,
        notes: c.notes || ''
      })) ?? [];
      setContacts(items);
    } catch (err: any) {
      toast.error(err.message || 'İletişim talepleri alınamadı');
    }
  };

  const updateContactStatus = async (id: number, status: 'New' | 'Contacted' | 'Completed') => {
    try {
      const statusMap: Record<string, number> = { New: 0, Contacted: 1, Completed: 2 };
      await contactAPI.update(id, { status: statusMap[status] });
      toast.success('Durum güncellendi');
      await fetchContacts();
    } catch (err: any) {
      toast.error(err.message || 'Durum güncellenemedi');
    }
  };

  const deleteContact = async (id: number) => {
    try {
      await contactAPI.delete(id);
      toast.success('Talep silindi');
      await fetchContacts();
    } catch (err: any) {
      toast.error(err.message || 'Silme başarısız');
    }
  };

  const handleMediaUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedia.title || !newMedia.category || !newMedia.file) {
      toast.error('Başlık, kategori ve dosya gereklidir');
      return;
    }
    try {
      setIsUploading(true);
      const fd = new FormData();
      fd.append('Title', newMedia.title);
      fd.append('Category', newMedia.category);
      if (newMedia.description) fd.append('Description', newMedia.description);
      if (newMedia.location) fd.append('Location', newMedia.location);
      fd.append('File', newMedia.file as any);
      const res = await mediaAPI.upload(fd);
      toast.success(res.message || 'Medya yüklendi');
      setNewMedia({ title: '', category: 'ev', description: '', location: '', file: null });
      await fetchMedia();
      setActiveTab('media');
    } catch (err: any) {
      toast.error(err.message || 'Yükleme başarısız');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteMedia = async (id: number) => {
    try {
      await mediaAPI.delete(id);
      toast.success('Medya silindi');
      await fetchMedia();
    } catch (err: any) {
      toast.error(err.message || 'Silme başarısız');
    }
  };

  const openEdit = (item: any) => {
    setEditForm({
      title: item.title,
      category: item.category,
      description: item.description || '',
      location: item.location || '',
      status: item.status === 'active'
    });
    setEditing({ open: true, item });
  };

  const saveEdit = async () => {
    if (!editing.item) return;
    try {
      const payload: any = {
        title: editForm.title,
        category: editForm.category,
        description: editForm.description,
        location: editForm.location,
        status: editForm.status ? 0 : 1
      };
      await mediaAPI.update(editing.item.id, payload);
      toast.success('Medya güncellendi');
      setEditing({ open: false, item: null });
      await fetchMedia();
    } catch (err: any) {
      toast.error(err.message || 'Güncelleme başarısız');
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Lila İlaçlama</h1>
                <p className="text-sm text-gray-600">Admin Paneli</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Ana Sayfa
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-5 lg:w-2/3">
            <TabsTrigger value="dashboard" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center">
              <ImageIcon className="h-4 w-4 mr-2" />
              Medya
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Yükle
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              İletişim
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Ayarlar
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
              <p className="text-gray-600">Sistem genel durumu ve istatistikler</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Toplam Medya</CardTitle>
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mediaItems.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 bu ay
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aktif İçerik</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mediaItems.filter(item => item.status === 'active').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Yayında olan içerikler
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Site Ziyaretçi</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">
                    +12% bu ay
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Teklif Talepleri</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">
                    +5 bu hafta
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Son Aktiviteler</CardTitle>
                <CardDescription>
                  Son yapılan işlemler ve güncellemeler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Plus className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Yeni medya eklendi</p>
                      <p className="text-xs text-gray-500">2 saat önce</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Edit className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">İçerik güncellendi</p>
                      <p className="text-xs text-gray-500">5 saat önce</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Management Tab */}
          <TabsContent value="media" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Medya Yönetimi</h2>
              <p className="text-gray-600">Yüklenen resim ve videoları yönetin</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediaItems.map((item) => (
                <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {item.type === 'video' ? (
                          <Video className="h-5 w-5 text-purple-600" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-purple-600" />
                        )}
                        <Badge variant="secondary">
                          {item.type === 'video' ? 'Video' : 'Resim'}
                        </Badge>
                      </div>
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {item.status === 'active' ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>
                      Kategori: {item.category} • {item.date}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(item)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Düzenle
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteMedia(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Medya Yükle</h2>
              <p className="text-gray-600">Yeni resim ve video yükleyin</p>
            </div>

            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Yeni İçerik Ekle</CardTitle>
                <CardDescription>
                  Galeri için yeni resim veya video yükleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMediaUpload} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Başlık</Label>
                    <Input
                      id="title"
                      value={newMedia.title}
                      onChange={(e) => setNewMedia({ ...newMedia, title: e.target.value })}
                      placeholder="İçerik başlığı"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Select value={newMedia.category} onValueChange={(value) => setNewMedia({ ...newMedia, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ev">Ev İlaçlama</SelectItem>
                        <SelectItem value="isyeri">İşyeri</SelectItem>
                        <SelectItem value="cevre">Çevre Dostu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea
                      id="description"
                      value={newMedia.description}
                      onChange={(e) => setNewMedia({ ...newMedia, description: e.target.value })}
                      placeholder="İçerik açıklaması"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Konum</Label>
                    <Input
                      id="location"
                      value={newMedia.location}
                      onChange={(e) => setNewMedia({ ...newMedia, location: e.target.value })}
                      placeholder="İstanbul, Kadıköy"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file">Dosya</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Dosyayı buraya sürükleyin veya seçin</p>
                      <Input
                        id="file"
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => setNewMedia({ ...newMedia, file: e.target.files?.[0] || null })}
                      />
                      <Button type="button" variant="outline" onClick={() => document.getElementById('file')?.click()}>
                        Dosya Seç
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isUploading}>
                    <Plus className="h-4 w-4 mr-2" />
                    {isUploading ? 'Yükleniyor...' : 'İçerik Ekle'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">İletişim Talepleri</h2>
              <p className="text-gray-600">Formdan gelen talepleri görüntüleyin ve yönetin</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Gelen Talepler</CardTitle>
                <CardDescription>Son gönderimler listelenir</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ad Soyad</TableHead>
                        <TableHead>E-posta</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Hizmet</TableHead>
                        <TableHead>Mesaj</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Tarih</TableHead>
                        <TableHead className="text-right">İşlem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-gray-500">Henüz talep yok</TableCell>
                        </TableRow>
                      ) : contacts.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell>{c.email}</TableCell>
                          <TableCell>{c.phone}</TableCell>
                          <TableCell className="capitalize">{c.service}</TableCell>
                          <TableCell className="max-w-xs truncate" title={c.message}>{c.message}</TableCell>
                          <TableCell>
                            <Badge variant={c.status === 'Completed' ? 'default' : c.status === 'Contacted' ? 'secondary' : 'outline'}>
                              {c.status === 'New' ? 'Yeni' : c.status === 'Contacted' ? 'İletişime Geçildi' : 'Tamamlandı'}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(c.createdAt).toLocaleString()}</TableCell>
                          <TableCell className="text-right space-x-2">
                            {c.status !== 'Contacted' && (
                              <Button size="sm" variant="outline" onClick={() => updateContactStatus(c.id, 'Contacted')}>
                                İletişime Geçildi
                              </Button>
                            )}
                            {c.status !== 'Completed' && (
                              <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => updateContactStatus(c.id, 'Completed')}>
                                Tamamlandı
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => deleteContact(c.id)}>
                              Sil
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Ayarlar</h2>
              <p className="text-gray-600">Site ayarları ve konfigürasyon</p>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Site Bilgileri</CardTitle>
                  <CardDescription>
                    Genel site bilgilerini düzenleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Şirket Adı</Label>
                    <Input value={settingsForm.companyName} onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefon</Label>
                    <Input value={settingsForm.phone} onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>E-posta</Label>
                    <Input value={settingsForm.email} onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Adres</Label>
                    <Textarea value={settingsForm.address} onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })} />
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700" onClick={async () => {
                    try {
                      await settingsAPI.update({
                        companyName: settingsForm.companyName,
                        phone: settingsForm.phone,
                        email: settingsForm.email,
                        address: settingsForm.address,
                      });
                      toast.success('Ayarlar kaydedildi');
                    } catch (err: any) {
                      toast.error(err.message || 'Ayarlar kaydedilemedi');
                    }
                  }}>
                    Kaydet
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Güvenlik</CardTitle>
                  <CardDescription>
                    Admin paneli güvenlik ayarları
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mevcut Şifre</Label>
                    <Input type="password" value={pwdForm.current} onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Yeni Şifre</Label>
                    <Input type="password" value={pwdForm.next} onChange={(e) => setPwdForm({ ...pwdForm, next: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Yeni Şifre Tekrar</Label>
                    <Input type="password" value={pwdForm.next2} onChange={(e) => setPwdForm({ ...pwdForm, next2: e.target.value })} />
                  </div>
                  <Button variant="outline" onClick={async () => {
                    if (!pwdForm.next || pwdForm.next !== pwdForm.next2) {
                      toast.error('Yeni şifreler uyuşmuyor');
                      return;
                    }
                    try {
                      await settingsAPI.changePassword(pwdForm.current, pwdForm.next);
                      toast.success('Şifre güncellendi');
                      setPwdForm({ current: '', next: '', next2: '' });
                    } catch (err: any) {
                      toast.error(err.message || 'Şifre güncellenemedi');
                    }
                  }}>
                    Şifre Değiştir
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Edit Dialog */}
          <Dialog open={editing.open} onOpenChange={(open) => setEditing({ open, item: open ? editing.item : null })}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Medya Düzenle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Başlık</Label>
                  <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Açıklama</Label>
                  <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Konum</Label>
                  <Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="status" checked={editForm.status} onCheckedChange={(v) => setEditForm({ ...editForm, status: v })} />
                  <Label htmlFor="status">Aktif</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditing({ open: false, item: null })}>İptal</Button>
                <Button onClick={saveEdit}>Kaydet</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Tabs>
      </div>
    </div>
  );
}