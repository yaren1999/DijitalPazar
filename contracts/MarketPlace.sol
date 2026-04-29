// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract Marketplace is Ownable, Pausable {
    IERC20 public token;
    IERC721 public nftContract;

    struct Item {
        uint256 id;
        uint256 nftId;
        uint256 price;
        address payable seller;
        bool isSold;
    }

    mapping(uint256 => Item) public items;
    uint256 public itemCount; 

    event ItemListed(uint256 id, uint256 nftId, uint256 price, address seller);
    event ItemSold(uint256 id, uint256 nftId, uint256 price, address seller, address buyer);

    constructor(address _tokenAddress, address _nftAddress) Ownable(msg.sender) {
        token = IERC20(_tokenAddress);
        nftContract = IERC721(_nftAddress);
    }

    function listItem(uint256 _nftId, uint256 _price) public whenNotPaused {
        require(_price > 0, "Fiyat 0 olamaz");
        require(nftContract.ownerOf(_nftId) == msg.sender, "Bu NFT'nin sahibi degilsiniz");

        itemCount++; 
        items[itemCount] = Item(
            itemCount,
            _nftId,
            _price,
            payable(msg.sender),
            false
        );

        emit ItemListed(itemCount, _nftId, _price, msg.sender);
    }

    function buyItem(uint256 _id) public whenNotPaused {
        require(_id > 0 && _id <= itemCount, "Urun mevcut degil");
        Item storage item = items[_id];
        
        require(!item.isSold, "Urun zaten satildi");
        require(item.seller != msg.sender, "Satici kendi urununu alamaz");
        require(token.transferFrom(msg.sender, item.seller, item.price), "Odeme basarisiz");
        nftContract.safeTransferFrom(item.seller, msg.sender, item.nftId);

        item.isSold = true;
        emit ItemSold(item.id, item.nftId, item.price, item.seller, msg.sender);
    }

    function updateItemPrice(uint256 _id, uint256 _newPrice) public {
        require(_id > 0 && _id <= itemCount, "Urun mevcut degil");
        Item storage item = items[_id];
        
        require(msg.sender == item.seller, "Sadece satici guncelleyebilir");
        require(!item.isSold, "Satilmis urun degismez");
        require(_newPrice > 0, "Fiyat 0 olamaz");

        item.price = _newPrice;
    }

    function cancelListing(uint256 _id) public {
        require(_id > 0 && _id <= itemCount, "Urun mevcut degil");
        Item storage item = items[_id];
        
        require(msg.sender == item.seller, "Sadece satici iptal edebilir");
        require(!item.isSold, "Satilmis urun iptal edilemez");

        item.isSold = true; 
    }

    function pause() public onlyOwner { _pause(); }
    function unpause() public onlyOwner { _unpause(); }
}