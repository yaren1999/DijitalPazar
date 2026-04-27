const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFT (Dijital Varlık) Testleri", function () {
    let MyNFT, myNFT, owner, addr1;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        MyNFT = await ethers.getContractFactory("MyNFT");
        myNFT = await MyNFT.deploy();
    });

    it("Düzgün isim ve sembolle başlamalı", async function () {
        expect(await myNFT.name()).to.equal("Dijital Sanat");
        expect(await myNFT.symbol()).to.equal("DSNFT");
    });

    it("Sadece sahibi (Owner) NFT üretebilmeli", async function () {
        
        await myNFT.mintNFT(addr1.address);
        expect(await myNFT.balanceOf(addr1.address)).to.equal(1);
        expect(await myNFT.ownerOf(0)).to.equal(addr1.address);
    });

    it("Sahibi olmayan biri NFT üretmeye çalışırsa hata vermeli", async function () {
        await expect(
            myNFT.connect(addr1).mintNFT(addr1.address)
        ).to.be.reverted; 
    });
});