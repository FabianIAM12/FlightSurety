pragma solidity ^0.5.11;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../contracts/FlightSuretyData.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {
    // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)
    using SafeMath for uint256;

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

    address private contractOwner;          // Account used to deploy contract
    FlightSuretyData private dataContract;  // Contract that holds all the data

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    modifier requireIsOperational()
    {
        // Modify to call data contract's status
        require(true, "Contract is currently not working in operational mode");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
     * @dev Modifier that requires the "ContractOwner" account to be the function caller
     */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not the contract owner");
        _;
    }

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
     * @dev Contract constructor
     *
     */
    constructor(address payable dataContract_) public
    {
        contractOwner = msg.sender;
        dataContract = FlightSuretyData(dataContract_);
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Modifier that requires the "operational" boolean variable to be "true"
     *      This is used on all state changing functions to pause the contract in
     *      the event there is an issue that needs to be fixed
     */
    function isOperational() public view returns(bool)
    {
        // does this work?
        return dataContract.isOperational();  // Modify to call data contract's status
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
     * @dev Add an airline to the registration queue
     *
     */
    function registerAirline(address airline, string calldata name) external returns(bool success, uint256 votes)
    {
        return dataContract.registerAirline(msg.sender, airline, name);
    }

    /**
     * @dev Fund an airline
     * Returns true if the airline is now funded (has received 10 ether).
     */
    function fundAirline() public payable returns (bool)
    {
        bool isFunded = dataContract.fundAirline(msg.sender, msg.value);
        address(dataContract).transfer(msg.value);
        return isFunded;
    }

    function hasVoted(address airline) public view returns (bool)
    {
        return dataContract.hasVoted(msg.sender, airline);
    }

    function numberOfVotes(address airline) public view returns (uint256)
    {
        return dataContract.numberOfVotes(airline);
    }

    function isRegistered(address airline) public view returns (bool, uint256)
    {
        return dataContract.isAirlineRegistered(airline);
    }

    function isFunded(address airline) public view returns (bool, uint256)
    {
        return dataContract.isAirlineFunded(airline);
    }

    function buyFlightInsurance(address airline, string memory flight, uint256 timestamp) public payable returns (bool)
    {
        // Insurance amount, 0 to 1 ether.
        require(msg.value > 0, "Insurance amount not sent");

        uint value = msg.value;
        uint returnValue = 0;
        if (value > 1 ether) {
            value = 1 ether;
            returnValue = msg.value.sub(1 ether);
        }

        bool bought = dataContract.buyFlightInsurance(msg.sender, value, airline, flight, timestamp);
        address(dataContract).transfer(value);
        if (returnValue > 0) {
            msg.sender.transfer(returnValue);
        }

        return bought;
    }

    // how much was payed for insurance?
    function insuredAmount(address airline, string memory flight, uint256 timestamp) public view returns (uint)
    {
        return dataContract.insuredAmount(msg.sender, airline, flight, timestamp);
    }

    // pay passengers accordingly
    function payPassenger() public
    {
        return dataContract.pay(msg.sender);
    }


    /**
     * @dev Register a future flight for insuring.
     *
     */
    function registerFlight(string memory flight, uint256 timestamp) public returns (bytes32)
    {
        return dataContract.registerFlight(msg.sender, flight, timestamp);
    }

    /**
     * @dev Called after oracle has updated flight status
     */
    function processFlightStatus(address airline, string memory flight, uint256 timestamp, uint8 statusCode)
    internal
    {
        dataContract.processFlightStatus(airline, flight, timestamp, statusCode);
        if (statusCode == STATUS_CODE_LATE_AIRLINE) {
            dataContract.creditInsurees(airline, flight, timestamp);
        }
    }

    /**
    * @dev Credit insurees as direct test approach for frontend
     */
    function creditInsurees(address airline, string calldata flight, uint256 timestamp, uint8 statusCode)
    external
    {
        if (statusCode == STATUS_CODE_LATE_AIRLINE) {
            dataContract.creditInsurees(airline, flight, timestamp);
        }
    }

    // Request for oracles to fetch flight information
    function fetchFlightStatus(address airline, string calldata flight, uint256 timestamp) external
    {
        uint8 index = getRandomIndex(msg.sender);
        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        oracleResponses[key] = ResponseInfo({requester: msg.sender, isOpen: true});
        emit OracleRequest(index, airline, flight, timestamp);
    }

    function getFlightStatus(address airline, string calldata flight, uint256 timestamp)
    external view returns (uint8)
    {
        return dataContract.getFlightStatus(airline, flight, timestamp);
    }

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
    event OracleRequest(uint8 indexed index, address airline, string flight, uint256 timestamp);

    // Register an oracle with the contract
    function registerOracle() external payable
    {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");
        uint8[3] memory indexes = generateIndexes(msg.sender);
        oracles[msg.sender] = Oracle({isRegistered: true, indexes: indexes});
        address(dataContract).transfer(msg.value);
    }

    function getMyIndexes() external view returns(uint8[3] memory)
    {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");
        return oracles[msg.sender].indexes;
    }

    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse(uint8 index, address airline, string calldata flight,
        uint256 timestamp, uint8 statusCode) external
    {
        require((oracles[msg.sender].indexes[0] == index) || (oracles[msg.sender].indexes[1] == index) ||
            (oracles[msg.sender].indexes[2] == index), "Index does not match oracle request");

        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        require(oracleResponses[key].isOpen, "Flight or timestamp do not match oracle request");

        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCode);
        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) {

            emit FlightStatusInfo(airline, flight, timestamp, statusCode);

            // Allow passengers to continue querying
            oracleResponses[key].isOpen = false;

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
        }
    }

    function getFlightKey(address airline, string memory flight, uint256 timestamp) internal pure returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes(address account) internal returns(uint8[3] memory)
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
    function getRandomIndex(address account) internal returns (uint8)
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

    /**
     * @dev Fallback function.
     * Just forward any funds to the data contract.
     */
    function() external payable
    {
        address(dataContract).transfer(msg.value);
    }
}