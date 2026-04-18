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

    describe("Dağıtım ve Temel Fonksiyonlar", function () {
        it("Toplam arz doğru belirlenmeli", async function () {
            expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY);
        });

        it("Sahip (Owner) tüm arza sahip olmalı", async function () {
            expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
        });
    });

    describe("Transfer İşlemleri", function () {
        it("Token transferi gerçekleşmeli", async function () {
            const amount = ethers.parseEther("100");
            await token.transfer(addr1.address, amount);
            expect(await token.balanceOf(addr1.address)).to.equal(amount);
        });

        it("Yetersiz bakiye durumunda transfer reddedilmeli", async function () {
            const initialOwnerBalance = await token.balanceOf(owner.address);
            await expect(
                token.connect(addr1).transfer(owner.address, 1)
            ).to.be.reverted;
        });
    });

    describe("Güvenlik ve Pausable (Durdurulabilirlik)", function () {
        it("Sistem durdurulduğunda transfer yapılamamalı", async function () {
            await token.pause();
            await expect(
                token.transfer(addr1.address, 100)
            ).to.be.revertedWithCustomError(token, "EnforcedPause");
        });

        it("Sadece sahip (Owner) sistemi durdurabilmeli", async function () {
            await expect(
                token.connect(addr1).pause()
            ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
        });

        it("Sistem açıldığında transferler devam etmeli", async function () {
            await token.pause();
            await token.unpause();
            await expect(token.transfer(addr1.address, 100)).to.not.be.reverted;
        });
    });

    describe("Mint ve Burn (Üretme ve Yakma)", function () {
        it("Sahip yeni token üretebilmeli", async function () {
            const mintAmount = ethers.parseEther("500");
            await token.mint(addr1.address, mintAmount);
            expect(await token.balanceOf(addr1.address)).to.equal(mintAmount);
        });

        it("Kullanıcılar kendi tokenlarını yakabilmeli", async function () {
            const burnAmount = ethers.parseEther("100");
            await token.transfer(addr1.address, burnAmount);
            await token.connect(addr1).burn(burnAmount);
            expect(await token.balanceOf(addr1.address)).to.equal(0);
        });
    });
});