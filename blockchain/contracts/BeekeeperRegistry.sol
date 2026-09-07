// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title BeekeeperRegistry
 * @dev Manages beekeeper registration and records on-chain.
 */
contract BeekeeperRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant BEEKEEPER_ROLE = keccak256("BEEKEEPER_ROLE");

    struct Beekeeper {
        uint256 id;
        string kvicId;
        string name;
        string location;
        string ipfsHash;
        bool isActive;
        uint256 registeredAt;
    }

    mapping(uint256 => Beekeeper) public beekeepers;
    uint256 public beekeeperCount;

    event BeekeeperRegistered(uint256 indexed id, string kvicId, uint256 timestamp);
    event BeekeeperUpdated(uint256 indexed id, uint256 timestamp);

    /**
     * @dev Constructor grants `DEFAULT_ADMIN_ROLE` and `ADMIN_ROLE` to the deployer.
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Registers a new beekeeper.
     * @param kvicId Khadi and Village Industries Commission ID.
     * @param name Name of the beekeeper.
     * @param location Location of the beekeeper.
     * @param ipfsHash IPFS hash of off-chain details.
     */
    function registerBeekeeper(
        string memory kvicId,
        string memory name,
        string memory location,
        string memory ipfsHash
    ) external onlyRole(ADMIN_ROLE) {
        beekeeperCount++;
        uint256 newId = beekeeperCount;

        beekeepers[newId] = Beekeeper({
            id: newId,
            kvicId: kvicId,
            name: name,
            location: location,
            ipfsHash: ipfsHash,
            isActive: true,
            registeredAt: block.timestamp
        });

        emit BeekeeperRegistered(newId, kvicId, block.timestamp);
    }

    /**
     * @dev Updates the IPFS hash for an existing beekeeper.
     * @param id The ID of the beekeeper.
     * @param newIpfsHash The new IPFS hash.
     */
    function updateBeekeeper(uint256 id, string memory newIpfsHash) external onlyRole(ADMIN_ROLE) {
        require(id > 0 && id <= beekeeperCount, "Invalid beekeeper ID");
        beekeepers[id].ipfsHash = newIpfsHash;
        emit BeekeeperUpdated(id, block.timestamp);
    }

    /**
     * @dev Deactivates a beekeeper.
     * @param id The ID of the beekeeper.
     */
    function deactivateBeekeeper(uint256 id) external onlyRole(ADMIN_ROLE) {
        require(id > 0 && id <= beekeeperCount, "Invalid beekeeper ID");
        beekeepers[id].isActive = false;
        emit BeekeeperUpdated(id, block.timestamp);
    }

    /**
     * @dev Retrieves beekeeper details.
     * @param id The ID of the beekeeper.
     * @return Beekeeper struct.
     */
    function getBeekeeper(uint256 id) public view returns (Beekeeper memory) {
        require(id > 0 && id <= beekeeperCount, "Invalid beekeeper ID");
        return beekeepers[id];
    }

    /**
     * @dev Retrieves total number of registered beekeepers.
     * @return Total count.
     */
    function getBeekeeperCount() public view returns (uint256) {
        return beekeeperCount;
    }
}
