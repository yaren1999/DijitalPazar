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
});