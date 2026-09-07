// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title HoneyBatch
 * @dev Core traceability contract tracking honey batches through the supply chain.
 */
contract HoneyBatch is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant BEEKEEPER_ROLE = keccak256("BEEKEEPER_ROLE");
    bytes32 public constant LAB_TESTER_ROLE = keccak256("LAB_TESTER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    enum BatchStatus { Harvested, SubmittedForTest, Testing, Certified, Rejected, Packaged, Dispatched, Delivered }

    struct Batch {
        uint256 id;
        string batchCode;
        uint256 beekeeperId;
        string floralSource;
        uint256 quantity;
        uint256 harvestTimestamp;
        BatchStatus status;
        string certIpfsHash;
        bool isCertified;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct StatusUpdate {
        BatchStatus status;
        address updatedBy;
        uint256 timestamp;
        string notes;
    }

    mapping(uint256 => Batch) public batches;
    mapping(uint256 => StatusUpdate[]) public batchHistory;
    uint256 public batchCount;

    event BatchCreated(uint256 indexed id, string batchCode, uint256 indexed beekeeperId, uint256 timestamp);
    event BatchStatusUpdated(uint256 indexed batchId, BatchStatus oldStatus, BatchStatus newStatus, address indexed updatedBy, uint256 timestamp);
    event BatchCertified(uint256 indexed batchId, bool passed, uint256 timestamp);

    /**
     * @dev Constructor grants roles to the deployer for testing and administration.
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(BEEKEEPER_ROLE, msg.sender);
        _grantRole(LAB_TESTER_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, msg.sender);
    }

    /**
     * @dev Grants BEEKEEPER_ROLE to an address.
     */
    function grantBeekeeperRole(address account) external onlyRole(ADMIN_ROLE) {
        _grantRole(BEEKEEPER_ROLE, account);
    }

    /**
     * @dev Grants LAB_TESTER_ROLE to an address.
     */
    function grantLabTesterRole(address account) external onlyRole(ADMIN_ROLE) {
        _grantRole(LAB_TESTER_ROLE, account);
    }

    /**
     * @dev Grants DISTRIBUTOR_ROLE to an address.
     */
    function grantDistributorRole(address account) external onlyRole(ADMIN_ROLE) {
        _grantRole(DISTRIBUTOR_ROLE, account);
    }

    /**
     * @dev Creates a new batch of honey.
     */
    function createBatch(
        string memory batchCode,
        uint256 beekeeperId,
        string memory floralSource,
        uint256 quantity,
        uint256 harvestTimestamp
    ) external returns (uint256) {
        batchCount++;
        uint256 newId = batchCount;

        batches[newId] = Batch({
            id: newId,
            batchCode: batchCode,
            beekeeperId: beekeeperId,
            floralSource: floralSource,
            quantity: quantity,
            harvestTimestamp: harvestTimestamp,
            status: BatchStatus.Harvested,
            certIpfsHash: "",
            isCertified: false,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        _addStatusHistory(newId, BatchStatus.Harvested, "Batch created");

        emit BatchCreated(newId, batchCode, beekeeperId, block.timestamp);
        return newId;
    }

    /**
     * @dev Updates the status of a batch.
     */
    function updateStatus(uint256 batchId, BatchStatus newStatus, string memory notes) external {
        require(batchId > 0 && batchId <= batchCount, "Invalid batch ID");
        Batch storage b = batches[batchId];
        BatchStatus oldStatus = b.status;

        require(_isValidTransition(oldStatus, newStatus), "Invalid status transition");

        b.status = newStatus;
        b.updatedAt = block.timestamp;

        _addStatusHistory(batchId, newStatus, notes);

        emit BatchStatusUpdated(batchId, oldStatus, newStatus, msg.sender, block.timestamp);
    }

    /**
     * @dev Certifies a batch after lab testing.
     */
    function certifyBatch(uint256 batchId, string memory certIpfsHash, bool passed) external onlyRole(LAB_TESTER_ROLE) {
        require(batchId > 0 && batchId <= batchCount, "Invalid batch ID");
        Batch storage b = batches[batchId];
        
        require(b.status == BatchStatus.Testing, "Batch not in testing state");

        b.certIpfsHash = certIpfsHash;
        b.isCertified = passed;
        b.updatedAt = block.timestamp;
        
        BatchStatus newStatus = passed ? BatchStatus.Certified : BatchStatus.Rejected;
        b.status = newStatus;
        
        _addStatusHistory(batchId, newStatus, passed ? "Batch certified" : "Batch rejected");

        emit BatchStatusUpdated(batchId, BatchStatus.Testing, newStatus, msg.sender, block.timestamp);
        emit BatchCertified(batchId, passed, block.timestamp);
    }

    function getBatch(uint256 batchId) public view returns (Batch memory) {
        require(batchId > 0 && batchId <= batchCount, "Invalid batch ID");
        return batches[batchId];
    }

    function getBatchHistory(uint256 batchId) public view returns (StatusUpdate[] memory) {
        require(batchId > 0 && batchId <= batchCount, "Invalid batch ID");
        return batchHistory[batchId];
    }

    function getBatchCount() public view returns (uint256) {
        return batchCount;
    }

    function _addStatusHistory(uint256 batchId, BatchStatus status, string memory notes) internal {
        batchHistory[batchId].push(StatusUpdate({
            status: status,
            updatedBy: msg.sender,
            timestamp: block.timestamp,
            notes: notes
        }));
    }

    function _isValidTransition(BatchStatus current, BatchStatus next) internal pure returns (bool) {
        if (current == BatchStatus.Harvested && next == BatchStatus.SubmittedForTest) return true;
        if (current == BatchStatus.SubmittedForTest && next == BatchStatus.Testing) return true;
        if (current == BatchStatus.Testing && (next == BatchStatus.Certified || next == BatchStatus.Rejected)) return true;
        if (current == BatchStatus.Certified && next == BatchStatus.Packaged) return true;
        if (current == BatchStatus.Packaged && next == BatchStatus.Dispatched) return true;
        if (current == BatchStatus.Dispatched && next == BatchStatus.Delivered) return true;
        if (current == BatchStatus.Rejected && next == BatchStatus.SubmittedForTest) return true;
        return false;
    }
}
