// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FileRegistry
 * @dev Decentralized Immutable Storage & Integrity Verification Smart Contract
 */
contract FileRegistry {
    struct FileRecord {
        string fileHash; // SHA-256 Hash of original file
        string ipfsCid; // Encrypted file CID on IPFS
        address owner; // Wallet address of owner
        uint256 timestamp; // Registration UNIX timestamp
        string fileName; // Original filename
        uint256 fileSize; // File size in bytes
        bool isExist; // Record existence flag
    }

    // Mapping from fileHash => FileRecord
    mapping(string => FileRecord) private files;

    // Mapping from fileHash => user address => access granted boolean
    mapping(string => mapping(address => bool)) private accessPermissions;

    // Events for distributed audit indexing
    event FileRegistered(
        string indexed fileHashKey,
        string fileHash,
        string ipfsCid,
        address indexed owner,
        uint256 timestamp,
        string fileName
    );

    event OwnershipTransferred(
        string indexed fileHashKey,
        address indexed previousOwner,
        address indexed newOwner
    );

    event AccessGranted(string indexed fileHashKey, address indexed grantee);
    event AccessRevoked(string indexed fileHashKey, address indexed grantee);

    modifier onlyFileOwner(string memory _fileHash) {
        require(files[_fileHash].isExist, "FileRegistry: File does not exist");
        require(
            files[_fileHash].owner == msg.sender,
            "FileRegistry: Caller is not file owner"
        );
        _;
    }

    /**
     * @dev Register a new file record on the blockchain
     */
    function registerFile(
        string memory _fileHash,
        string memory _ipfsCid,
        string memory _fileName,
        uint256 _fileSize
    ) external {
        require(bytes(_fileHash).length > 0, "FileRegistry: Empty file hash");
        require(!files[_fileHash].isExist, "FileRegistry: File already registered");

        files[_fileHash] = FileRecord({
            fileHash: _fileHash,
            ipfsCid: _ipfsCid,
            owner: msg.sender,
            timestamp: block.timestamp,
            fileName: _fileName,
            fileSize: _fileSize,
            isExist: true
        });

        accessPermissions[_fileHash][msg.sender] = true;

        emit FileRegistered(
            _fileHash,
            _fileHash,
            _ipfsCid,
            msg.sender,
            block.timestamp,
            _fileName
        );
    }

    /**
     * @dev Verify if a file hash is authentic and registered
     */
    function verifyFile(string memory _fileHash)
        external
        view
        returns (
            bool isAuthentic,
            string memory ipfsCid,
            address owner,
            uint256 timestamp,
            string memory fileName,
            uint256 fileSize
        )
    {
        if (!files[_fileHash].isExist) {
            return (false, "", address(0), 0, "", 0);
        }

        FileRecord memory f = files[_fileHash];
        return (true, f.ipfsCid, f.owner, f.timestamp, f.fileName, f.fileSize);
    }

    /**
     * @dev Transfer file ownership to a new wallet address
     */
    function transferOwnership(string memory _fileHash, address _newOwner)
        external
        onlyFileOwner(_fileHash)
    {
        require(_newOwner != address(0), "FileRegistry: Invalid new owner address");

        address prevOwner = files[_fileHash].owner;
        files[_fileHash].owner = _newOwner;
        accessPermissions[_fileHash][_newOwner] = true;

        emit OwnershipTransferred(_fileHash, prevOwner, _newOwner);
    }

    /**
     * @dev Grant file access permission to a specific wallet address
     */
    function grantAccess(string memory _fileHash, address _grantee)
        external
        onlyFileOwner(_fileHash)
    {
        require(_grantee != address(0), "FileRegistry: Invalid grantee address");
        accessPermissions[_fileHash][_grantee] = true;
        emit AccessGranted(_fileHash, _grantee);
    }

    /**
     * @dev Revoke file access permission from a specific wallet address
     */
    function revokeAccess(string memory _fileHash, address _grantee)
        external
        onlyFileOwner(_fileHash)
    {
        require(_grantee != files[_fileHash].owner, "FileRegistry: Cannot revoke owner access");
        accessPermissions[_fileHash][_grantee] = false;
        emit AccessRevoked(_fileHash, _grantee);
    }

    /**
     * @dev Check if a user address has access permission
     */
    function hasAccess(string memory _fileHash, address _user)
        external
        view
        returns (bool)
    {
        if (!files[_fileHash].isExist) return false;
        if (files[_fileHash].owner == _user) return true;
        return accessPermissions[_fileHash][_user];
    }

    /**
     * @dev Retrieve full details of a registered file
     */
    function getFileDetails(string memory _fileHash)
        external
        view
        returns (FileRecord memory)
    {
        require(files[_fileHash].isExist, "FileRegistry: File record not found");
        return files[_fileHash];
    }
}
