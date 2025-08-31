# Lila İlaçlama .NET 8 Web API

Bu proje mevcut Node/Express backend'ini .NET 8 C# Web API'ye çevirir ve verileri SQLite ile kalıcı (dinamik) hale getirir.

## Özellikler
- JWT ile kimlik doğrulama (`/api/auth/login`, `/api/auth/verify`)
- İletişim talepleri CRUD ve istatistikler (`/api/contact`)
- Medya yükleme (resim/video), CRUD ve istatistikler (`/api/media`)
- Site ayarları alma/güncelleme (`/api/settings`)
- Yüklemeler için statik dosya sunumu (`/uploads`)
- CORS, rate limiting, sıkıştırma, global hata yakalama

## Hızlı Başlangıç

1) Gerekenler: .NET 8 SDK

2) Ortam değişkenleri (opsiyonel):
- `JWT_SECRET` (varsayılan: çok uzun rastgele bir anahtar)
- `ADMIN_USERNAME` (varsayılan: admin)
- `ADMIN_PASSWORD` (varsayılan: 123456)

3) Çalıştırma:

```powershell
cd "c:\Users\karac\Desktop\web ilaclama\dotnet-api\LilaIlaclama.Api"; dotnet restore; dotnet run
```

API: http://localhost:5000

Sağlık kontrolü: http://localhost:5000/api/health

4) Frontend CORS izinleri:
- http://localhost:5173
- http://localhost:3000

## Notlar
- Veritabanı dosyası `./App_Data/lila.db` konumunda otomatik oluşturulur ve seed veriler eklenir.
- Yüklemeler `./uploads` klasörüne kaydedilir ve `/uploads` altında servis edilir.
