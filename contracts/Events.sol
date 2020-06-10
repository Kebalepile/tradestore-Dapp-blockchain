pragma solidity ^0.6.4;


contract Events {
    event ContractCreated(address _contract, address _vendorAddress, string _message);
    event AgreementCreated(string _message);
    event AgreementBinding(string _message);
    event AgreementAborted(string _message);
    event AgreementConcluded(string _message);
    event RefundPerformed(string _message);
    event ContractTerminated(string _message);
    event NewContract(address _addr, string _message, address _creator);
    // CREATE AN EVENT  THAT ALERTS CUSTOMER & VENDOR THAT HE GOT PAID WHEN 
    // CONCLUDING CONTRACT
}