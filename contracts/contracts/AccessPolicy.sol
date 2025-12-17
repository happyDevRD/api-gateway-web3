// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AccessPolicy {
    // Mapping: (Resource Path, User Role) -> Access Allowed (bool)
    mapping (string => mapping (string => bool)) private policy;
    
    // Mapping: Address -> Role
    mapping (address => string) public userRoles;

    // Constructor: Initial rules
    constructor() {
        policy["/api/admin"]["ADMIN"] = true;
        policy["/api/data"]["USER"] = true; // Added /api/data for our test case
        policy["/api/public"]["USER"] = true;
    }

    // Function to set role for a user
    function setUserRole(address _user, string memory _role) public {
        userRoles[_user] = _role;
    }

    // Function to define or modify a rule
    function setAccess(string memory _path, string memory _role, bool _access) public {
        policy[_path][_role] = _access;
    }

    // Function that API Gateway will consult (View)
    function checkAccess(string memory _path, string memory _role) public view returns (bool) {
        return policy[_path][_role];
    }
    
    // Helper to check by address directly (optional but useful)
    function checkAccessForAddress(string memory _path, address _user) public view returns (bool) {
        string memory role = userRoles[_user];
        return policy[_path][role];
    }
}
