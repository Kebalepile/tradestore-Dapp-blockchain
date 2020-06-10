pragma solidity ^0.6.4;

import "./SafeMath.sol";
import "./Events.sol";
import "./Middleware.sol";


//@dev contract facilitates payment between custormer and product
//provider
contract Sale is Middleware, Events {
    using SafeMath for uint256;
    //owner must be set to address of parent contract iniator
    // can only be rest by former owner
    address payable internal owner;
    address payable internal customer;
    address payable internal vendor;
    uint256 price;
    enum adPaid {No, Yes}
    adPaid internal paid;
    enum agreement {Created, Binding, Concluded, Cancelled, Unenforceable}
    agreement internal agreementState;

    mapping(address => uint256) internal balances;

    modifier adSpacePaid(adPaid answer) {
        require(answer == paid, "Add space already paid  for");
        _;
    }
    modifier currentAgreementState(agreement _current) {
        require(_current == agreementState, "Invalid agreement state");
        _;
    }

    function makePayment(bool _condition) internal pure returns (bool) {
        return _condition;
    }

    constructor(
        address payable _vendor,
        address payable _owner,
        uint256 _adPrice,
        uint256 _salePrice
    ) public payable {
        require(msg.value >= _adPrice, "not enough funds to pay ad space");
        owner = _owner;
        vendor = _vendor;
        price = _salePrice;
        balances[_vendor] = _adPrice;
        paid = adPaid.Yes;
        emit AgreementCreated("Vendor created a Contract");
    }

    function cancelOffer(address _addr)
        external
        onlyVendor(_addr, vendor)
        currentAgreementState(agreement.Created)
    {
        // refund vendor , deduct service rendered amount
        // payer owner a service fee of 35%
        //  use a math library
        //write code that transfers 65% of money correctly vendor from contract
        // and transfer whatever is left to owner from contract
        uint256 refund = uint256(balances[vendor].div(100).mul(65));
        require(
            makePayment((address(this).balance > refund)),
            "not enough funds available to process refund"
        );
        vendor.transfer(refund);
        require(
            makePayment((address(this).balance > 0)),
            "not enough funds available to pay owner"
        );
        owner.transfer(address(this).balance);
        agreementState = agreement.Cancelled;
        emit AgreementAborted("Vendor cancelled non-binding contract");
        selfdestruct(owner);
    }

    function acceptOffer(address payable _customer, uint256 _amt)
        external
        payable
        notVendor(_customer, vendor)
        saleRequiredAmount(_amt >= price ? true : false)
        currentAgreementState(agreement.Created)
    {
        customer = _customer;
        balances[_customer] = msg.value;
        agreementState = agreement.Binding;
        emit AgreementBinding("Binding contract created");
        // on the webapp site promte vendor to set estimated delivery time
        // when such time lapses & contract state is stil binding
        // cancel contract and refund ppl & terminate contract
    }

    function agreementConcluded(address _addr)
        external
        onlyCustomer(_addr, customer)
        currentAgreementState(agreement.Binding)
    {
        //  reward customer with 15% of vendor ad paid money
        uint256 reward = uint256(balances[vendor].div(100).mul(15));
        require(
            makePayment((address(this).balance > reward)),
            "not enough funds available to pay customer reward"
        );
        customer.transfer(reward);
        agreementState = agreement.Concluded;
        emit AgreementConcluded("Customer confirmed delivery of good/service");
    }

    function refund(address _addr)
        external
        onlyVendor(_addr, vendor)
        currentAgreementState(agreement.Binding)
    {
        // refund customer with his payment plus 8% of ad money vendor paid
        // refund vendor with 70% ad money vendor paid
        // pay owner 22% (ad money) left in contract account
        uint256 customerRefund = uint256(balances[customer].add(balances[vendor]).div(100).mul(8));
        uint256 vendorRefund = uint256(balances[vendor].div(100).mul(70));
        uint256 ownerReward = uint256(balances[vendor].div(100).mul(22));
        require(
            makePayment((address(this).balance > customerRefund)),
            "not enough funds available to pay customer"
        );
        customer.transfer(customerRefund);
        require(
            makePayment((address(this).balance > vendorRefund)),
            "not enough funds available to pay vendor"
        );
        vendor.transfer(vendorRefund);
        require(
            makePayment((address(this).balance >= ownerReward)),
            "not enough funds available to pay owner"
        );
        agreementState = agreement.Unenforceable;
        terminate();
    }

    function getPaid(address _addr)
        external
        onlyVendor(_addr, vendor)
        currentAgreementState(agreement.Concluded)
    {
        // pay vendor amount owned from sale plus 15% of ad money 
        // pay owner amount left in contract balance 70% (ad money)
        uint256 reward = uint256(balances[vendor].div(100).mul(15));
        uint256 total = uint256(reward.add(balances[customer]));
        require(
            makePayment((address(this).balance > total)),
            "not enough funds available to pay vendor"
        );
        vendor.transfer(total);
        require(
            makePayment((address(this).balance > 0)),
            "not enough funds available to pay owner"
        );
        owner.transfer(address(this).balance);
        agreementState = agreement.Unenforceable;
        emit AgreementConcluded("Contract successfully concluded by vendor");
        terminate();
    }

    // only callable if vendor failed to deliver after with estimated delivery time
    // set in web app database
    // give customer full refund no ad money share.
    // pay owner entire amount in contract
    // vendor gets nothing
    function terminateAndRefund(address _addr)
        external
        onlyOwner(_addr, owner)
        currentAgreementState(agreement.Binding)
    {
        require(
            makePayment((address(this).balance > balances[customer])),
            "not enough fund to pay customer"
        );
        customer.transfer(balances[customer]);
        require(
            makePayment((address(this).balance >= balances[vendor])),
            "not enough funds to pay owner"
        );
        agreementState = agreement.Unenforceable;
        terminate();
    }

    function terminate()
        internal
        currentAgreementState(agreement.Unenforceable)
    {
        balances[customer] = 0;
        balances[vendor] = 0;
        price = 0;
        emit ContractTerminated("Binding contract terminated");
        selfdestruct(owner);
    }

    //   write a fucntion that is to show how mush ether is neede to purcase
    // write a functiion that is to show balance of contract

    // decide to remove when deploying or not
    function getOwner() external view returns (address _owner) {
        _owner = owner;
    }
   // decide to remove when deploying or not
    function balance() external view returns (uint256 _amt) {
        _amt = address(this).balance;
    }
    // decide to remove when deploying or not
    function salePrice () external view returns (uint256 _salePrice) {
        _salePrice = price;
    }
}
