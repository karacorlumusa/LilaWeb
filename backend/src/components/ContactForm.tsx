import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { contactAPI } from '@/services/api';
import { Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleServiceChange = (value: string) => {
    setFormData({
      ...formData,
      service: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await contactAPI.submit(formData);
      
      if (response.success) {
        setIsSubmitted(true);
        toast.success('Mesajınız başarıyla gönderildi!');
        setFormData({
          name: '',
          email: '',
          phone: '',
          service: '',
          message: ''
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Mesaj gönderilirken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Mesajınız Alındı!</h3>
            <p className="text-gray-600">
              En kısa sürede size dönüş yapacağız. Teşekkür ederiz.
            </p>
            <Button 
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="w-full"
            >
              Yeni Mesaj Gönder
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="h-5 w-5 mr-2 text-purple-600" />
          İletişim Formu
        </CardTitle>
        <CardDescription>
          Size en uygun çözümü sunabilmemiz için bilgilerinizi paylaşın
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ad Soyad *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Adınız ve soyadınız"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-posta *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="ornek@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+90 5xx xxx xx xx"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Hizmet Türü</Label>
            <Select value={formData.service} onValueChange={handleServiceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Hizmet seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ev">Ev İlaçlama</SelectItem>
                <SelectItem value="isyeri">İşyeri İlaçlama</SelectItem>
                <SelectItem value="cevre">Çevre Dostu Çözümler</SelectItem>
                <SelectItem value="genel">Genel Bilgi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mesajınız *</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Detayları yazınız..."
              rows={4}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Gönderiliyor...
              </div>
            ) : (
              'Mesaj Gönder'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;