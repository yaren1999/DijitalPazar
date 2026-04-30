const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Kontratlar şu hesapla yayına alınıyor:", deployer.address);

  const Token = await ethers.getContractFactory("SecureToken");
  const token = await Token.deploy(ethers.parseEther("1000000"));
  await token.waitForDeployment();
  console.log("SecureToken adresi:", await token.getAddress());

  const NFT = await ethers.getContractFactory("MyNFT");
  const nft = await NFT.deploy();
  await nft.waitForDeployment();
  console.log("MyNFT adresi:", await nft.getAddress());

  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(await token.getAddress(), await nft.getAddress());
  await marketplace.waitForDeployment();
  console.log("Marketplace adresi:", await marketplace.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });