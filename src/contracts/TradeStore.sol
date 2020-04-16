pragma solidity ^0.6.4;
import "./Events.sol";
import "./Sale.sol";


contract TradeStore is Events {
    address payable public owner; //create a second in command address needed to  change  owners address 
                                 //decide to add it during TradeStore initiation or what.  
    mapping(address => uint256) public vendorContractCount;
    mapping(address => uint256) public customerContractCount;
    mapping(address => mapping(address => Sale)) public contractToVendor;
    mapping(address => mapping(address => Sale)) public contractToCustomer;
    mapping(address => Sale) public availableTradeAgreement;
    mapping(address => mapping(address => Sale)) public terminateSale;
    mapping(address => bool) public terminated;
    uint256 public totalSalesPending;
    uint256 public totalSalesBinding;
    uint256 public totalSalesDeclined;
    uint256 public totalSalesSucceeded;

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner is authorized ");
        _;
    }

    constructor() public payable {
        owner = msg.sender;
    }

    function makeOffer(uint256 _adPrice, uint256 _salePrice) external payable {
        Sale newSale = new Sale{value:_adPrice}(msg.sender, owner, _adPrice, _salePrice);
        contractToVendor[address(newSale)][msg.sender] = newSale;
        availableTradeAgreement[address(newSale)] = newSale;
        terminateSale[address(newSale)][owner] = newSale;
        vendorContractCount[msg.sender]++;
        totalSalesPending++;
        emit NewContract(address(newSale), "new sale contract created", msg.sender);
    }

    function acceptOffer(address _contract, uint256 _amt) external payable {
        if(terminated[_contract] != true){
                Sale agreement = availableTradeAgreement[_contract];
                agreement.acceptOffer{value:_amt}(msg.sender, _amt);
                contractToCustomer[_contract][msg.sender] = agreement;
                customerContractCount[msg.sender]++;
                totalSalesBinding++;
                totalSalesPending--;
        } else{
            revert("contract already terminated");
        }
    }

    function cancelOffer(address _contract) external {
        Sale agreement = contractToVendor[_contract][msg.sender];
        agreement.cancelOffer(msg.sender);
        totalSalesPending--;
    }
     function agreementConclude(address _contract) external {
        Sale agreement = contractToCustomer[_contract][msg.sender];
        agreement.agreementConcluded(msg.sender);
    }

    function refund(address _contract)external {
        Sale agreement = contractToVendor[_contract][msg.sender];
        agreement.refund(msg.sender);
        totalSalesBinding--;
        totalSalesDeclined++;
    }

    function getPaid(address _contract)external {
        Sale agreement = contractToVendor[_contract][msg.sender];
        agreement.getPaid(msg.sender);
        totalSalesBinding--;
        totalSalesSucceeded++;
    }

    function terminateAndRefund(address _contract)external onlyOwner {
        if (terminated[_contract]) {
            revert("contract already terminated");
        } else if (terminated[_contract] == false){
            Sale agreement = terminateSale[_contract][msg.sender];
            agreement.terminateAndRefund(msg.sender);
            terminated[_contract] = true;
            totalSalesBinding--;
            totalSalesDeclined++;
        }
    }

    function setOwner(address payable _owner) external onlyOwner {
        owner = _owner;
    }

    function getOwner(address _contract) external view returns (address _owner) {
       if(terminated[_contract]){
                revert("contract is already terminated");
       } else if (terminated[_contract] == false) {
               Sale agreement = availableTradeAgreement[_contract];
                _owner = agreement.getOwner();
       }
    }

    function contractBalance (address _contract) external view returns (uint256 _amt) {
         if(terminated[_contract]){
             revert("contract is already terminated");
       } else if (terminated[_contract] == false) {
            Sale agreement = availableTradeAgreement[_contract];
            _amt =  agreement.balance();
       }
    }

    function getSalePrice (address _contract) public view returns (uint256 _amt) {
          if(terminated[_contract]){
               revert("contract is already terminated");
       } else if (terminated[_contract] == false) {
             Sale agreement = availableTradeAgreement[_contract];
            _amt = agreement.salePrice();
       }
    }
}
