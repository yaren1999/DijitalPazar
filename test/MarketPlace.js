const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace (NFT Pazar Yeri) Kapsamlı Testler", function () {
    let token, nft, marketplace, owner, addr1, addr2;
    const PRICE = ethers.parseEther("100");

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("SecureToken");
        token = await Token.deploy(ethers.parseEther("1000000"));

        const NFT = await ethers.getContractFactory("MyNFT");
        nft = await NFT.deploy();

        const Marketplace = await ethers.getContractFactory("Marketplace");
        marketplace = await Marketplace.deploy(await token.getAddress(), await nft.getAddress());

        await token.transfer(addr1.address, ethers.parseEther("500"));
        await token.transfer(addr2.address, ethers.parseEther("500"));
        await nft.mintNFT(addr1.address, "ipfs://test");
    });

    describe("1. Listeleme Kontrolleri", function () {
        it("NFT sahibi dükkana NFT ekleyebilmeli", async function () {
            await nft.connect(addr1).approve(await marketplace.getAddress(), 0);
            await expect(marketplace.connect(addr1).listItem(0, PRICE))
                .to.emit(marketplace, "ItemListed");
        });

        it("Fiyat 0 olursa ürün listelenememeli", async function () {
            await nft.connect(addr1).approve(await marketplace.getAddress(), 0);
            await expect(marketplace.connect(addr1).listItem(0, 0))
                .to.be.revertedWith("Fiyat 0 olamaz");
        });

        it("Başkasına ait NFT listelenememeli", async function () {
            await expect(marketplace.connect(addr2).listItem(0, PRICE))
                .to.be.revertedWith("Bu NFT'nin sahibi degilsiniz");
        });
    });

    describe("2. Satın Alma ve Entegrasyon", function () {
        it("NFT satın alınabilmeli ve mülkiyet geçmeli", async function () {
            await nft.connect(addr1).approve(await marketplace.getAddress(), 0);
            await marketplace.connect(addr1).listItem(0, PRICE);

            await token.connect(addr2).approve(await marketplace.getAddress(), PRICE);
            await marketplace.connect(addr2).buyItem(1);

            expect(await nft.ownerOf(0)).to.equal(addr2.address);
            expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("600"));
        });
    });

    describe("3. Güvenlik ve Durdurma", function () {
        it("Sistem durdurulduğunda işlem yapılamamalı", async function () {
            await marketplace.pause();
            await expect(marketplace.connect(addr1).listItem(0, PRICE))
                .to.be.revertedWithCustomError(marketplace, "EnforcedPause");
        });
    });

    describe("4. Gelişmiş Satın Alma Kontrolleri", function () {
        it("Satıcı kendi NFT'sini satın alamamalı", async function () {
            await nft.connect(addr1).approve(await marketplace.getAddress(), 0);
            await marketplace.connect(addr1).listItem(0, PRICE);
            
            await expect(marketplace.connect(addr1).buyItem(1))
                .to.be.revertedWith("Satici kendi urununu alamaz"); 
        });

        
        it("Satılmış NFT tekrar satın alınamamalı", async function () {
            await nft.connect(addr1).approve(await marketplace.getAddress(), 0);
            await marketplace.connect(addr1).listItem(0, PRICE);
            await token.connect(addr2).approve(await marketplace.getAddress(), PRICE);
            await marketplace.connect(addr2).buyItem(1);

            await expect(marketplace.connect(addr2).buyItem(1))
                .to.be.revertedWith("Urun zaten satildi");
        });
    });
});