const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SecureToken Ekosistemi", function () {
    let Token, token, owner, addr1, addr2;
    const INITIAL_SUPPLY = ethers.parseEther("1000000");

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        Token = await ethers.getContractFactory("SecureToken");
        token = await Token.deploy(INITIAL_SUPPLY);
    });

    describe("1. Dağıtım ve Temel Bilgiler", function () {
        it("Toplam arz doğru belirlenmeli", async function () {
            expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY);
        });

        it("Sahip (Owner) tüm arza sahip olmalı", async function () {
            expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
        });
    });

    describe("2. Transfer ve Onay İşlemleri (ERC20 Standartları)", function () {
        it("Direkt transfer gerçekleşmeli", async function () {
            const amount = ethers.parseEther("100");
            await token.transfer(addr1.address, amount);
            expect(await token.balanceOf(addr1.address)).to.equal(amount);
        });

        
        it("Sıfır adresine (0x0) transfer yapılamamalı", async function () {
            await expect(
                token.transfer("0x0000000000000000000000000000000000000000", 100)
            ).to.be.reverted;
        });
     });
     describe("Approve - Allowance- TransferFrom işlemleri doğru mu", function (){   

        it("Approve ve TransferFrom (Aracı Transferi) çalışmalı", async function () {
            const amount = ethers.parseEther("100");
            await token.approve(addr1.address, amount);
            await token.connect(addr1).transferFrom(owner.address, addr2.address, amount);
            expect(await token.balanceOf(addr2.address)).to.equal(amount);
        });

        it("Allowance (İzin) harcandıkça azalmalı", async function () {
            const totalAllowance = ethers.parseEther("100");
            const spendAmount = ethers.parseEther("40");
            await token.approve(addr1.address, totalAllowance);
            await token.connect(addr1).transferFrom(owner.address, addr2.address, spendAmount);
            
            expect(await token.allowance(owner.address, addr1.address))
                .to.equal(totalAllowance - spendAmount);
        });

        
        it("İzin (Allowance) yoksa veya yetersizse transferFrom reddedilmeli", async function () {
            const limit = ethers.parseEther("10"); 
            const tryingToSpend = ethers.parseEther("50"); 

            await token.approve(addr1.address, limit);
            
            await expect(
                token.connect(addr1).transferFrom(owner.address, addr2.address, tryingToSpend)
            ).to.be.reverted;
        });

    });  
   

    describe("3. Güvenlik ve Pausable (Durdurulabilirlik)", function () {
        it("Sistem durdurulduğunda direkt transfer yapılamamalı", async function () {
        await token.pause();
        await expect(token.transfer(addr1.address, 100))
            .to.be.revertedWithCustomError(token, "EnforcedPause");
    });

    it("Sistem durdurulduğunda aracı transferi (transferFrom) yapılamamalı", async function () {
        await token.approve(addr1.address, 100);
        await token.pause();
        await expect(token.connect(addr1).transferFrom(owner.address, addr2.address, 50))
            .to.be.revertedWithCustomError(token, "EnforcedPause");
    });

    it("Sadece sahip (Owner) sistemi durdurabilmeli", async function () {
        await expect(token.connect(addr1).pause())
            .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
    });

    describe("4. Üretme ve Yakma (Mint & Burn)", function () {
        it("Sahip (Owner) yeni token üretebilmeli", async function () {
            const mintAmount = ethers.parseEther("500");
            await token.mint(addr1.address, mintAmount);
            expect(await token.balanceOf(addr1.address)).to.equal(mintAmount);
        });

        it("Owner olmayan biri mint yapamamalı", async function () {
            await expect(token.connect(addr1).mint(addr1.address, 100))
                .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
        });

        it("Kullanıcılar kendi tokenlarını yakabilmeli", async function () {
            const burnAmount = ethers.parseEther("100");
            await token.transfer(addr1.address, burnAmount);
            await token.connect(addr1).burn(burnAmount);
            expect(await token.balanceOf(addr1.address)).to.equal(0);
        });
    });
});