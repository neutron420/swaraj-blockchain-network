// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title GrievanceContract
 * @dev Stores immutable complaint records on Hyperledger Besu
 * Only stores audit trail data, not full complaint details
 */
contract GrievanceContract {
    
    // Complaint structure stored on-chain
    struct Complaint {
        string complaintId;           // From PostgreSQL
        string category;              // Standardized by AI
        string subcategory;           // Standardized by AI
        string urgency;               // AI predicted: low/medium/high/critical
        string status;                // open/in_progress/resolved/closed
        string descriptionHash;       // SHA-256 hash of description
        string attachmentHash;        // SHA-256 hash of attachment
        address submittedBy;          // Citizen's wallet address
        uint256 timestamp;            // Submission timestamp
        uint256 lastUpdated;          // Last status update
        string assignedTo;            // Department/officer ID
        string resolutionDate;        // When resolved (empty if pending)
    }
    
    // Mapping: complaintId => Complaint
    mapping(string => Complaint) public complaints;
    
    // Array to track all complaint IDs
    string[] public complaintIds;
    
    // Mapping to check if complaint exists
    mapping(string => bool) public complaintExists;
    
    // Events for tracking
    event ComplaintRegistered(
        string indexed complaintId,
        string category,
        string urgency,
        address submittedBy,
        uint256 timestamp
    );
    
    event ComplaintStatusUpdated(
        string indexed complaintId,
        string newStatus,
        uint256 timestamp
    );
    
    event ComplaintAssigned(
        string indexed complaintId,
        string assignedTo,
        uint256 timestamp
    );
    
    event ComplaintResolved(
        string indexed complaintId,
        string resolutionDate,
        uint256 timestamp
    );
    
    /**
     * @dev Register a new complaint on blockchain
     */
    function registerComplaint(
        string memory _complaintId,
        string memory _category,
        string memory _subcategory,
        string memory _urgency,
        string memory _descriptionHash,
        string memory _attachmentHash,
        address _submittedBy
    ) public {
        require(!complaintExists[_complaintId], "Complaint already exists");
        require(bytes(_complaintId).length > 0, "Complaint ID cannot be empty");
        
        Complaint memory newComplaint = Complaint({
            complaintId: _complaintId,
            category: _category,
            subcategory: _subcategory,
            urgency: _urgency,
            status: "open",
            descriptionHash: _descriptionHash,
            attachmentHash: _attachmentHash,
            submittedBy: _submittedBy,
            timestamp: block.timestamp,
            lastUpdated: block.timestamp,
            assignedTo: "",
            resolutionDate: ""
        });
        
        complaints[_complaintId] = newComplaint;
        complaintIds.push(_complaintId);
        complaintExists[_complaintId] = true;
        
        emit ComplaintRegistered(
            _complaintId,
            _category,
            _urgency,
            _submittedBy,
            block.timestamp
        );
    }
    
    /**
     * @dev Update complaint status
     */
    function updateStatus(
        string memory _complaintId,
        string memory _newStatus
    ) public {
        require(complaintExists[_complaintId], "Complaint does not exist");
        
        complaints[_complaintId].status = _newStatus;
        complaints[_complaintId].lastUpdated = block.timestamp;
        
        emit ComplaintStatusUpdated(_complaintId, _newStatus, block.timestamp);
    }
    
    /**
     * @dev Assign complaint to department/officer
     */
    function assignComplaint(
        string memory _complaintId,
        string memory _assignedTo
    ) public {
        require(complaintExists[_complaintId], "Complaint does not exist");
        
        complaints[_complaintId].assignedTo = _assignedTo;
        complaints[_complaintId].status = "in_progress";
        complaints[_complaintId].lastUpdated = block.timestamp;
        
        emit ComplaintAssigned(_complaintId, _assignedTo, block.timestamp);
    }
    
    /**
     * @dev Mark complaint as resolved
     */
    function resolveComplaint(
        string memory _complaintId,
        string memory _resolutionDate
    ) public {
        require(complaintExists[_complaintId], "Complaint does not exist");
        
        complaints[_complaintId].status = "resolved";
        complaints[_complaintId].resolutionDate = _resolutionDate;
        complaints[_complaintId].lastUpdated = block.timestamp;
        
        emit ComplaintResolved(_complaintId, _resolutionDate, block.timestamp);
    }
    
    /**
     * @dev Get complaint details
     */
    function getComplaint(string memory _complaintId) 
        public 
        view 
        returns (
            string memory complaintId,
            string memory category,
            string memory subcategory,
            string memory urgency,
            string memory status,
            string memory descriptionHash,
            string memory attachmentHash,
            address submittedBy,
            uint256 timestamp,
            uint256 lastUpdated,
            string memory assignedTo,
            string memory resolutionDate
        ) 
    {
        require(complaintExists[_complaintId], "Complaint does not exist");
        
        Complaint memory c = complaints[_complaintId];
        return (
            c.complaintId,
            c.category,
            c.subcategory,
            c.urgency,
            c.status,
            c.descriptionHash,
            c.attachmentHash,
            c.submittedBy,
            c.timestamp,
            c.lastUpdated,
            c.assignedTo,
            c.resolutionDate
        );
    }
    
    /**
     * @dev Get total number of complaints
     */
    function getComplaintCount() public view returns (uint256) {
        return complaintIds.length;
    }
    
    /**
     * @dev Get complaint ID by index
     */
    function getComplaintIdByIndex(uint256 index) public view returns (string memory) {
        require(index < complaintIds.length, "Index out of bounds");
        return complaintIds[index];
    }
    
    /**
     * @dev Verify complaint hash (for audit purposes)
     */
    function verifyComplaintHash(
        string memory _complaintId,
        string memory _descriptionHash
    ) public view returns (bool) {
        require(complaintExists[_complaintId], "Complaint does not exist");
        
        return keccak256(bytes(complaints[_complaintId].descriptionHash)) == 
               keccak256(bytes(_descriptionHash));
    }
}