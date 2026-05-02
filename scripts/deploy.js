const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Kontratlar şu hesapla yayına alınıyor:", deployer.address);

  const Token = await ethers.getContractFactory("SecureToken");
  const token = await Token.deploy(ethers.parseEther("1000000")); // 1 Milyon Token
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("1. SecureToken adresi:", tokenAddress);


  const NFT = await ethers.getContractFactory("MyNFT");
  const nft = await NFT.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("2. MyNFT adresi:", nftAddress);


  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(tokenAddress, nftAddress);
  await marketplace.waitForDeployment();
  console.log("3. Marketplace adresi:", await marketplace.getAddress());


  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(tokenAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("4. Staking adresi:", stakingAddress);

  console.log("-----------------------------------------------");
  console.log("TÜM KONTRATLAR BAŞARIYLA YÜKLENDİ!");
  console.log("Şimdi bu adresleri not al ve frontend için sakla.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });