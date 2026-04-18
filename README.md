🛒 DijitalPazar Ekosistemi

Bu proje, benim blokzincir geliştirme yetkinliklerimi pratik bir ekosisteme dönüştürme sürecimin en önemli adımıdır. 

Projenin Özeti:

- DijitalPazar; kendi kripto varlığı (DPT) üzerinden dönen, kullanıcıların ürün listeleyip alışveriş yapabildiği ve ellerindeki varlıkları kilitleyerek ödül kazanabildiği uçtan uca bir ticaret platformudur. Bu çalışmada, akıllı kontratların (Solidity) güvenliğini profesyonel test senaryolarıyla sağlarken, tüm bu karmaşık yapıyı React ve MetaMask üzerinden son kullanıcıya sunan modüler bir dApp mimarisi kurguladım.


🚀 Proje Bileşenleri
- **SecureToken (DPT): OpenZeppelin standartlarında, güvenli ve yakılabilir (burnable) ERC20 tokenı. Projenin ana finansal birimidir.

- **Marketplace: (Yapım aşamasında) Ürünlerin akıllı kontratlar üzerinden listelendiği ve DPT ile güvenli alışveriş yapıldığı platform.

- **Staking: (Yapım aşamasında) Kullanıcıların tokenlarını kilitleyerek ekosisteme olan katkıları karşılığında ödül kazandıkları modül.

- **Frontend (Geliştirme Aşamasında): React ve Ethers.js kullanılarak, MetaMask entegrasyonu ile tüm bu süreçlerin son kullanıcıyla buluştuğu arayüz.
```

🌐 Frontend ve Kullanıcı Deneyimi (UX)

Blockchain'in karmaşık yapısını son kullanıcıdan gizlemek projenin en büyük hedeflerinden biridir.

MetaMask entegrasyonu ile kullanıcılar klasik üyelik formlarıyla uğraşmadan, tek bir cüzdan onayıyla sisteme giriş yaparlar.

React arayüzü, blockchain üzerindeki anlık değişimleri (token bakiyesi, yeni eklenen ürünler) Ethers.js üzerinden dinleyerek kullanıcıya modern ve akıcı bir deneyim sunar.


## 🛠️ Kullanılan Teknolojiler
- **Solidity:** Akıllı kontrat dili.
- **Hardhat:** Geliştirme ve test ortamı.
- **OpenZeppelin:** Güvenlik kütüphaneleri.
- **Ethers.js & Mocha/Chai:** Test senaryoları.

"Bu projede güvenliği artırmak için Pausable pattern kullandım."

## 📦 Kurulum ve Çalıştırma

Önce bağımlılıkları yükleyin:
```bash
npm install --force

Kontratları derleyin:
- npx hardhat compile

Testleri çalıştırın:
- npx hardhat test