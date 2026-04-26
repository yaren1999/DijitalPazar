// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol"; // 1. Bunu ekledik

contract Marketplace is Ownable, Pausable {
    IERC20 public token;

    struct Item {
        uint256 id;
        string name;
        uint256 price;
        address payable seller;
        bool isSold;
    }

    mapping(uint256 => Item) public items;
    uint256 public itemCount; 

  
    event ItemListed(uint256 id, string name, uint256 price, address seller);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        token = IERC20(_tokenAddress);
    }

    function listItem(string memory _name, uint256 _price) public whenNotPaused {
        require(_price > 0, "Fiyat 0 olamaz");

        itemCount++; // Yeni bir ID oluştur
        items[itemCount] = Item(
            itemCount,
            _name,
            _price,
            payable(msg.sender),
            false
        );

        emit ItemListed(itemCount, _name, _price, msg.sender);
    }

   
   function buyItem(uint256 _id) public whenNotPaused {
     require(_id > 0 && _id <= itemCount, "Urun mevcut degil");
     Item storage item = items[_id];
     require(!item.isSold, "Urun zaten satildi");
    
     require(token.transferFrom(msg.sender, item.seller, item.price), "Odeme basarisiz");
     item.isSold = true;
    }

   function updateItemPrice(uint256 _id, uint256 _newPrice) public {
     require(_id > 0 && _id <= itemCount, "Urun mevcut degil");
     Item storage item = items[_id];
    
     require(msg.sender == item.seller, "Sadece satici fiyat guncelleyebilir");
     require(_newPrice > 0, "Fiyat 0 olamaz");
     require(!item.isSold, "Satilmis urunun fiyati degismez");

     item.price = _newPrice;
    }


  function cancelListing(uint256 _id) public {
     require(_id > 0 && _id <= itemCount, "Urun mevcut degil");
     Item storage item = items[_id];
   
     require(msg.sender == item.seller, "Sadece satici iptal edebilir");
     require(!item.isSold, "Satilmis urun iptal edilemez");

     item.isSold = true; 
    }

    function pause() public onlyOwner {
      _pause();
     }

     function unpause() public onlyOwner {
      _unpause();
    }
}