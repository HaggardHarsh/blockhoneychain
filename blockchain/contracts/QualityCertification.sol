// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract QualityCertification {
    address public admin;

    struct Certification {
        uint256 batchId;
        address labTester;
        uint256 moisture;
        uint256 hmf;
        uint256 diastase;
        bool passed;
        string reportIpfsHash;
        uint256 timestamp;
    }

    mapping(uint256 => Certification) public certifications;

    constructor() {
        admin = msg.sender;
    }

    function submitCertification(
        uint256 batchId,
        uint256 moisture,
        uint256 hmf,
        uint256 diastase,
        bool passed,
        string memory reportIpfsHash
    ) external {
        if (msg.sender != admin) revert();
        if (certifications[batchId].timestamp != 0) revert();

        certifications[batchId] = Certification({
            batchId: batchId,
            labTester: msg.sender,
            moisture: moisture,
            hmf: hmf,
            diastase: diastase,
            passed: passed,
            reportIpfsHash: reportIpfsHash,
            timestamp: block.timestamp
        });
    }

    function getCertification(uint256 batchId) external view returns (Certification memory) {
        return certifications[batchId];
    }

    function hasCertification(uint256 batchId) external view returns (bool) {
        return certifications[batchId].timestamp != 0;
    }
}
