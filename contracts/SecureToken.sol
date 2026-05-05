
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// [IMPORTLAR: Bu projenin üzerine inşa edildiği dev kütüphaneler]
import "@openzeppelin/contracts/token/ERC20/ERC20.sol"; // Standart para birimi kuralları (ERC20)
import "@openzeppelin/contracts/access/Ownable.sol";   // Sadece senin (sahibinin) yapabileceği işleri belirler
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol"; // Paranın yakılabilmesini sağlar
import "@openzeppelin/contracts/utils/Pausable.sol"; // Acil durumda tüm işlemleri durdurma düğmesi ekler

// [CONTRACT: Ekosistemin ana motoru]
contract SecureToken is ERC20, Ownable, ERC20Burnable, Pausable {
    
    // [CONSTRUCTOR: Kontrat yayına girdiği an (deploy) sadece BİR KEZ çalışan kısım]
    constructor(uint256 initialSupply) 
        ERC20("Dijital Pazar Token", "DPT") // Paranın adını ve sembolünü belirler
        Ownable(msg.sender) // Kontratın sahibi, bu kontratı deploy eden (sensin!) der
    {
        // _mint: Yoktan var etmek demektir.
        // Belirlediğin miktarı (initialSupply) senin cüzdanına (msg.sender) tanımlar.
        _mint(msg.sender, initialSupply); 
    }

    // [PAUSE & UNPAUSE: Güvenlik Şalterleri]
    // Eğer bir hack şüphesi olursa, sahibi (sen) bu fonksiyonu çağırarak 
    // paranın transferini dondurabilirsin.

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // [MINT: Para basma yetkisi]
    // İleride ekosistem büyürse, sahibi olarak piyasaya yeni DPT sürebilmeni sağlar.
    
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // [INTERNAL UPDATE: Kontratın beyni ve trafik polisi]
    // Bu fonksiyon her para transferinde (gönderme, alma, yakma) arka planda çalışır.
    // 'whenNotPaused' ekledik; yani şalter kapalıyken (pause) bu fonksiyon çalışmaz.
    // Dolayısıyla kimse kimseye para gönderemez.

    function _update(address from, address to, uint256 value) internal virtual override whenNotPaused {
        super._update(from, to, value); // OpenZeppelin'in kendi güvenli transfer mantığını çalıştırır
    }
}