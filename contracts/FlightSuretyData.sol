pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    // Account used to deploy contract
    address private contractOwner;
    // Blocks all state changes throughout the contract if false
    bool private operational = true;
    uint256 private numberOfAirlines; //counter to keep how many registered airlines are there

    mapping (bytes32 => Flight) private flights; //flightsKeys to Flight
    bytes32[] private flightKeys; //array of keys for the registered flights
    mapping (address => uint256) airlineBalances;

    mapping (address => bool) authorizedContracts;
    mapping(address => bool) private authorizeCallers;

    struct Airline {
        bytes32 name;
        bool isRegistered;
        bool isVerified;
    }

    struct Flight {
        address airline;
        bytes32 flightNumber;
        uint256 timestamp;
        uint8 statusCode;
    }

    mapping (address => Airline) private airlines;

    mapping (bytes32 => bytes32[]) private flightInsurances; //flightKeys to InsurancesKeys;
    mapping (bytes32 => Insurance) private insurances; //insuranceKey to InsuranceDetails
    mapping (address => uint256) private insureeBalances; //balance for each insuree

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor(bytes32 name) public {
        contractOwner = msg.sender;
        airlines[msg.sender] = Airline(name, true, true);
        numberOfAirlines = numberOfAirlines.add(1);
    }

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
        require(operational == true, "Contract is currently not operational");
        _;
        // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /**
    * @dev Modifier that requires the caller to be an authorized contract
     */
    modifier isAuthorized(){
        require (authorizedContracts[msg.sender] == true, "2Caller is not authorized");
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
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperational() public view returns (bool) {
        return operational;
    }

    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus
    (
        bool mode
    )
    external
    requireContractOwner
    {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
     * @dev Add an airline to the registration queue
     * Can only be called from FlightSuretyApp contract
     */
    function registerAirline(address _address, bytes32 name)
    external
    isAuthorized
    requireIsOperational
    {
        airlines[_address] = Airline(name, true, false);
        numberOfAirlines = numberOfAirlines.add(1);
    }

    function getAirline(address _address)
    external
    view
    isAuthorized
    requireIsOperational
    returns(bytes32, bool, bool)
    {
        Airline storage airline = airlines[_address];
        return (airline.name, airline.isRegistered, airline.isVerified);
    }

    function registerFlight(address airline, bytes32 number, uint256 time, uint8 status)
    external
    isAuthorized
    requireIsOperational
    {
        bytes32 key = generateKey(airline, number, time);
        flights[key] = Flight(airline, number, time, status);
        flightKeys.push(key);
    }

    function getAllFlights() external returns(bytes32[] memory) {
        bytes32[] memory flightnrs = new bytes32[](flightKeys.length);
        for (uint i = 0; i < flightKeys.length; i++) {
            flightnrs[i] = flights[flightKeys[i]].flightNumber;
        }
        return flightnrs;
    }

    function getBalanceOfAirline(address _airline) external view
    isAuthorized
    requireIsOperational
    returns(uint256)
    {
        return airlineBalances[_airline];
    }

    /**
     * @dev Is the airline known to the contract?  Returns true or false.
     */
    function isAirline(address _address)
    external
    view
    // requireAppCaller()
    returns (bytes32, bool, bool)
    {
        Airline storage airline = airlines[_address];
        return (airline.name, airline.isRegistered, airline.isVerified);
    }

    function getNumberOfAirlines() external view isAuthorized requireIsOperational returns(uint256) {
        return numberOfAirlines;
    }

    function getFlightDetails(bytes32 _flightNumber)
    external
    view
    isAuthorized
    requireIsOperational
    returns (
        address,
        bytes32,
        uint256,
        uint8,
        bytes32
    )
    {
        Flight storage flight = flights[bytes32(0)];
        for (uint8 i = 0; i < flightKeys.length; i++){
            if (flights[flightKeys[i]].flightNumber == _flightNumber){
                    flight = flights[flightKeys[i]];
                    return (flight.airline, flight.flightNumber, flight.timestamp, flight.statusCode, flightKeys[i]
                );
            }
        }
        return (flight.airline, flight.flightNumber, flight.timestamp, flight.statusCode, bytes32(0));
    }

    /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
     * resulting in insurance payouts, the contract should be self-sustaining.
     * This is the method freshly joined airlines would call to pay their fee after they have been vetted in
     */
    function fundAirline(address airline, uint256 amount) external isAuthorized requireIsOperational {
        airlineBalances[airline] = airlineBalances[airline].add(amount);
    }

    function validateAirline(address _address) external isAuthorized requireIsOperational {
        airlines[_address].isVerified = true;
    }

    /**
     * @dev Buy insurance for a flight
    *
    */
    function buyInsurence(bytes32 flightKey, address _insuree, uint256 amount) external isAuthorized requireIsOperational
    {
        bytes32 insurenceKey = generateKey(_insuree, flightKey, 0);
        insurences[insurenceKey] = Insurence(_insuree, amount, false);
        flightInsurences[flightKey].push(insurenceKey);
        airlineBalances[flights[flightKey].airline] = airlineBalances[flights[flightKey].airline].add(amount);
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
    (
    )
    external
    pure
    {
    }


    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
    (
    )
    external
    pure
    {
    }

    function authorizeCaller(address addressToAuthorize)
    external
    requireContractOwner()
    {
        authorizeCallers[addressToAuthorize] = true;
    }

    // function to authorize addresses (especially the App contract!) to call functions from flighSuretyData contract
    function authorizeContract(address callerAddress)
    external
        requireContractOwner
        requireIsOperational
    {
        authorizedContracts[callerAddress] = true;
    }

    /**
     * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */
    function fund
    (
    )
    public
    payable
    {
    }

    function getFlightKey
    (
        address airline,
        string memory flight,
        uint256 timestamp
    )
    pure
    internal
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function()
    external
    payable
    {
        fund();
    }

    function generateKey (address _address, bytes32 key, uint256 value)
    internal
    view
    requireIsOperational
    returns(bytes32)
    {
        return keccak256(abi.encodePacked(_address, key, value));
    }
}
