const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace (Pazar Yeri) Testleri", function () {
    let Token, token, Marketplace, marketplace, owner, addr1, addr2;
    const INITIAL_SUPPLY = ethers.parseEther("1000000");

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        Token = await ethers.getContractFactory("SecureToken");
        token = await Token.deploy(INITIAL_SUPPLY);

        Marketplace = await ethers.getContractFactory("Marketplace");
        marketplace = await Marketplace.deploy(await token.getAddress());
       });

     describe("1. Ürün Listeleme (Listing)", function () {
        it("Satıcı dükkana ürün ekleyebilmeli", async function () {
            const price = ethers.parseEther("50"); 
            await expect(marketplace.connect(addr1).listItem("Laptop", price))
                .to.emit(marketplace, "ItemListed");

            const item = await marketplace.items(1);
            expect(item.name).to.equal("Laptop");
            expect(item.price).to.equal(price);
            expect(item.seller).to.equal(addr1.address);
            expect(item.isSold).to.equal(false);
        });

        it("Fiyat 0 olursa ürün listelenememeli", async function () {
            await expect(
                marketplace.connect(addr1).listItem("Bedava Ürün", 0)
            ).to.be.revertedWith("Fiyat 0 olamaz");
        });
      });

     describe("2. Satın Alma (Buying)", function () {
       const price = ethers.parseEther("50");

      beforeEach(async function () {
        await marketplace.connect(addr1).listItem("Laptop", price);
     
      });

      it("Ürün satın alınabilmeli ve para satıcıya gitmeli", async function () {
            await token.transfer(addr2.address, price);
            await token.connect(addr2).approve(await marketplace.getAddress(), price);
            await marketplace.connect(addr2).buyItem(1);

            
            expect(await token.balanceOf(addr1.address)).to.equal(price); 
            const item = await marketplace.items(1);
            expect(item.isSold).to.equal(true); 
          });

         it("Parası yetmeyen biri almaya çalışınca hata vermeli", async function () {
            await token.connect(addr2).approve(await marketplace.getAddress(), price);
            await expect(
                marketplace.connect(addr2).buyItem(1)
            ).to.be.reverted;
        });
   });

   describe("3. Ürün Yönetimi (Update & Cancel)", function () {
    const initialPrice = ethers.parseEther("50");
    const newPrice = ethers.parseEther("70");

    beforeEach(async function () {
        await marketplace.connect(addr1).listItem("Klavye", initialPrice);
    });

    it("Satıcı ürünün fiyatını güncelleyebilmeli (Test 7)", async function () {
        await marketplace.connect(addr1).updateItemPrice(1, newPrice);
        const item = await marketplace.items(1);
        expect(item.price).to.equal(newPrice);
    });

    it("Başka biri fiyatı değiştirmeye çalışırsa hata vermeli (Test 8)", async function () {
        await expect(
            marketplace.connect(addr2).updateItemPrice(1, newPrice)
        ).to.be.revertedWith("Sadece satici fiyat guncelleyebilir");
    });

    it("Satıcı ürünü satıştan kaldırabilmeli (Test 9)", async function () {
        await marketplace.connect(addr1).cancelListing(1);
        const item = await marketplace.items(1);
        expect(item.isSold).to.equal(true);
    });
});
});