pragma solidity ^0.4.25;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    address private contractOwner;
    FlightSuretyData data;

    /*
    uint256 private AIRLINE_FEE =  0.00000001 ether;
    uint256 private MAX_INSURANCE =  0.000000001 ether;
    uint256 private CONSENSUS = 4;
    uint256 private CONSENSUS_RULE = 5; // percentage of airlines to vote for consensus

    bool private operational = true;
    uint256 private numberOfAirlines;


    mapping(address => address[]) airlineVotes; //airlineAddress -> address[] voters

    event AirlineRegistered(address indexed airline, uint256 votes);

    event AirlineFunded(address indexed airline, uint256 value);
    */

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational()
    {
        // Modify to call data contract's status
        require(true, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier minimumFee(uint256 fee){
        require(msg.value >= fee, 'Minimum fee is required');
        _;
    }

    modifier airlineRegistered {
        bool isRegistered;
        (,isRegistered,) = data.getAirline(msg.sender);
        require(isRegistered == true, 'Caller is not a registered airline');
        _;
    }

    /**
     * @dev Modifier that requires the "ContractOwner" account to be the function caller
     */
    modifier onlyOwner(){
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier newValidAirline(address newAirline) {
        require (address(0x0) != newAirline, 'Invalid address to register');
        bool isRegistered;
        bool isValidated;
        (,isRegistered,isValidated) = data.getAirline(newAirline);
        require (!isRegistered && !isValidated, 'Airline is already validated');
        _;
    }

    modifier airlineValidated {
        bool isValidated;
        (,,isValidated) = data.getAirline(msg.sender);
        require(isValidated == true, 'Caller is not a validated airline');
        _;
    }

    modifier flightInexistent(bytes32 flightNumber) {
        address airline;
        (airline,,,,) = data.getFlightDetails(flightNumber);
        require(airline == address(0), 'Flight already registered');
        _;
    }

    modifier flightExistent(bytes32 flightNumber) {
        address airline;
        (airline,,,,) = data.getFlightDetails(flightNumber);
        require(airline != address(0), 'Flight does not exist');
        _;
    }

    modifier notInsured(bytes32 flightNumber) {
        bytes32 flightKey;
        (,,,,flightKey) = data.getFlightDetails(flightNumber);
        bytes32 insuranceKey = generateKey(msg.sender, flightKey, 0);
        address insuree;
        (insuree,,) = data.getInsuranceDetails(insuranceKey);
        require(insuree == address(0), 'Insurance exists already');
        _;
    }

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
    * @dev Contract constructor
    */
    constructor(address _dataContractAddress) public {
        contractOwner = msg.sender;
        data = FlightSuretyData(_dataContractAddress);
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperational() public view returns (bool) {
        return operational;
    }

    function setOperatingStatus(bool mode)
    external
    onlyOwner
    {
        require(mode != operational, "Contract is already in this state");
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
    * @dev Add an airline to the registration queue
    */
    function registerAirline(address _newAirline, bytes32 airlineName)
    external returns(bool success, uint256 votes)
    {
        return data.registerAirline(msg.sender, airline, name);
    }

    /**
    * @dev Fund an airline and increase their wealth
    *
    */
    function fundAirline() public payable returns (bool) {
        bool funded = data.fundAirline(msg.sender, msg.value);
        address(dataContract).transfer(msg.value);

        return funded;
    }

    function hasVoted(address airline) public view returns (bool)
    {
        return data.hasVoted(msg.sender, airline);
    }

    function numVotes(address airline) public view returns (uint256)
    {
        return data.numVotes(airline);
    }

    function isRegistered(address airline) public view returns (bool, uint256)
    {
        return data.isAirlineRegistered(airline);
    }

    function isFounded(address airline) public view returns (bool, uint256)
    {
        return data.isAirlineFunded(airline);
    }

    // call is made by passenger

    function buyInsurance(address airline, string memory flight, uint256 timestamp) public payable returns (bool)
    {
        // Require insurance amount, 0 to 1 ether
        require(msg.value > 0, "Insurance amount not sent");

        // is it more?
        uint value = msg.value;
        uint retvalue = 0;
        if (value > 1 ether) {
            value = 1 ether;
            retvalue = msg.value.sub(1 ether);
        }
        bool bought = data.buyInsurance(msg.sender, value, airline, flight, timestamp);
        address(dataContract).transfer(value);

        if (retvalue > 0) {
            msg.sender.transfer(retvalue);
        }

        return bought;
    }

    function insuredAmount(address airline, string memory flight, uint256 timestamp) public views return (uint)
    {
        return data.insuredAmount(msg.sender, airline, flight, timestamp);
    }

    function payPassenger() public {
        return data.pay(msg.sender);
    }

    function registerFlight(string memory flight, uint256 timestamp) public return (bytes32)
    {
        return data.registerFlight(msg.sender, flight, timestamp);
    }

    function processFlightStatus(address airline, string memory flight, uint256 timestamp, unit8 statusCode) internal
    {
        data.processFlightStatus(airline, flight, timestamp, statusCode);
        if (statusCode == STATUS_CODE_LATE_AIRLINE) {
            data.creditInsurees(airline, flight, timestamp);
        }
    }

    function fetchFlightStatus(address airline, string calldata flight, uint256 timestamp) external
    {
        uint8 index = getRandomIndex(msg.sender);

        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        oracleResponses[key] = ResponseInfo({requester: msg.sender, isOpen: true});

        emit OracleRequest(index, airline, flight, timestamp);
    }

    function getFlightStatus(address airline, string calldata flight, uint256 timestamp) external view returns (uint8)
    {
        return data.getFlightStatus(airline, flight, timestamp);
    }

    // region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;


    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
        // This lets us group responses and identify
        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(address airline, string flight, uint256 timestamp, uint8 status);

    event OracleReport(address airline, string flight, uint256 timestamp, uint8 status);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint8 index, address airline, string flight, uint256 timestamp);


    // Register an oracle with the contract
    function registerOracle
    (
    )
    external
    payable
    {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({
        isRegistered: true,
        indexes: indexes
        });
    }

    function getMyIndexes
    (
    )
    view
    external
    returns(uint8[3])
    {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");

        return oracles[msg.sender].indexes;
    }

    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse
    (
        uint8 index,
        address airline,
        string flight,
        uint256 timestamp,
        uint8 statusCode
    )
    external
    {
        require((oracles[msg.sender].indexes[0] == index) || (oracles[msg.sender].indexes[1] == index) || (oracles[msg.sender].indexes[2] == index), "Index does not match oracle request");


        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        require(oracleResponses[key].isOpen, "Flight or timestamp do not match oracle request");

        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCode);
        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) {

            emit FlightStatusInfo(airline, flight, timestamp, statusCode);

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
        }
    }


    function getFlightKey
    (
        address airline,
        string flight,
        uint256 timestamp
    )
    pure
    internal
    returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes
    (
        address account
    )
    internal
    returns(uint8[3])
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);

        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex
    (
        address account
    )
    internal
    returns (uint8)
    {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

    // endregion

}

    /* add functionalities hier */

contract FlightSuretyData {
    function getAirline(address _address) external view returns(bytes32, bool, bool);
    function validateAirline(address _address) external;
    function fundAirline(address airline, uint256 amount) external;
    function getNumberOfAirlines() external view returns(uint256);
    function registerAirline(address _address, bytes32 name) external;
    function getFlightDetails(bytes32 _flightNumber) external view
    returns (
        address,
        bytes32,
        uint256,
        uint8,
        bytes32
    );
    function registerFlight(address airline, bytes32 number, uint256 time, uint8 status) external;
    function getAllFlights() external view returns(bytes32[] memory);
    function getBalanceOfAirline(address _airline) external view returns(uint256);
    function buyInsurance(bytes32 flightKey, address _insuree, uint256 amount) external;
    function getInsuranceDetails(bytes32 insuranceKey) external view returns(address, uint256, bool);
    /*
    function getEstimativeCreditingCost(bytes32 flightKey) external view returns(uint256);
    function setFlightStatus(bytes32 flightKey, uint8 _statusCode) external;
    function creditInsurees(bytes32 flightKey, uint8 delta) external;
    function pay(address _insuree, uint256 amount) external;
    function getBalanceOfInsuree(address _insuree) external view returns(uint256); */
}