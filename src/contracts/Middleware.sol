pragma solidity ^0.6.4;



contract Middleware {
    modifier onlyOwner(address _addr, address _owner) {
        require(_addr == _owner, "only owner can call this function ");
        _;
    }
    modifier onlyCustomer(address _addr, address _customer) {
        require(
            _addr == _customer,
            "Only customer can call this function "
        );
        _;
    }

    modifier onlyVendor(address _addr, address _vendor) {
        require(_addr == _vendor, "Only vendor can call this function");
        _;
    }

    modifier notVendor(address _customer, address _vendor) {
        require(
            _customer != _vendor,
            "Vendor cannot buy his/her own thing(s)"
        );
        _;
    }
    modifier saleRequiredAmount(bool _res) {
        require(_res, "amount not enough to cover sale costs");
        _;
    }
}
