// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Alyra Voting Dapp Project
 * @notice Protocol to enable users to create and vote on proposals
 * @author Fabien Frick
 */
contract Voting is Ownable {

    /**
    * @notice Winning proposal ID
    */
    uint256 public winningProposalId;

    /**
    * @notice In case of draw
    */   
    uint256[] winningProposalsID;

    /**
    * @notice In case of draw
    */
    Proposal[] winningProposals;

    /**
     * @notice Struct Voter
     */
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedProposalId;
    }

    /**
     * @notice Struct Proposal
     */
    struct Proposal {
        string description;
        uint256 voteCount;
    }

    /**
     * @notice WorkflowStatus Enum
     */
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    /**
     * @notice Workflow Status
     */
    WorkflowStatus public workflowStatus;

    /**
     * @notice Proposals Array
     */
    Proposal[100] public proposalsArray; // FAILLE DE SECURITE : Possible DoS (Denial of Service) donc on limite l'array à 100 propositions maximum.

    /**
     * @notice Voters mapping
     */
    mapping(address => Voter) private voters;

    /**
     * @notice Notice when a voter is registered
     * @param _voterAddress The voter's address registered
     */
    event VoterRegistered(address _voterAddress);

    /**
     * @notice Signals when workflow status changes
     * @param _previousStatus The previous workflow status
     * @param _newStatus The new workflow status
     */
    event WorkflowStatusChange( WorkflowStatus _previousStatus, WorkflowStatus _newStatus);

    /**
     * @notice Notice when a proposal is registered
     * @param _proposalId ID of the proposal
     */
    event ProposalRegistered(uint256 _proposalId);

    /**
     * @notice Signals when a voter vote for a proposal
     * @param _voter proposal address
     * @param _proposalId proposal id
     */
    event Voted(address _voter, uint256 _proposalId);

    /**
     * @notice Modifier for whitelisted voters only
     */
    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "You're not a voter");
        _;
    }

    /**
     * @notice Returns Voter information. Only available for registered voters
     * @param _addr Voter's address
     */
    function getVoter(address _addr) external view onlyVoters returns (Voter memory) {
        return voters[_addr];
    }

    /**
     * @notice Returns a Proposal
     * @param _id Proposal's ID
     */
    function getOneProposal(uint256 _id) external view onlyVoters returns (Proposal memory) {
        return proposalsArray[_id];
    }

    /**
     * @notice Whitelist an address
     * @param _addr Address to whitelist
     */
    function addVoter(address _addr) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "Voters registration is not open yet");
        require(voters[_addr].isRegistered != true, "Already registered");

        voters[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }

    /**
     * @notice Add a proposal in the array. Only whitelisted addresses
     * @param _desc Description of the proposal
     */
    function addProposal(string memory _desc) external onlyVoters {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "Proposals are not allowed yet");
        require(keccak256(abi.encode(_desc)) != keccak256(abi.encode("")), "Vous ne pouvez pas ne rien proposer"); 

        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray.push(proposal);
        emit ProposalRegistered(proposalsArray.length - 1);
    }

    /**
     * @notice Vote for a proposal. Only whitelisted addresses
     * @param _id Proposal's ID
     */
    function setVote(uint256 _id) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "Voting session havent started yet");
        require(voters[msg.sender].hasVoted != true, "You have already voted");
        require(_id <= proposalsArray.length, "Proposal not found");

        voters[msg.sender].votedProposalId = _id;
        voters[msg.sender].hasVoted = true;
        proposalsArray[_id].voteCount++;

        emit Voted(msg.sender, _id);
    }

    /**
     * @notice Owner Only. Starts proposals registration. Updates workflow to ProposalsRegistrationStarted.
     */
    function startProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "Registering proposals cant be started now");
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    /**
     * @notice Owner Only. Ends proposals registration. Updates workflow to ProposalsRegistrationEnded.
     */
    function endProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "Registering proposals havent started yet");
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    /**
     * @notice Owner Only. Starts voting session. Updates workflow to VotingSessionStarted.
     */
    function startVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, "Registering proposals phase is not finished");
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    /**
     * @notice Owner Only. Ends voting session. Updates workflow to VotingSessionEnded.
     */
    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "Voting session havent started yet");
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    /**
     * @notice Tally votes and set the winning proposal. Only owner.
     */
    function tallyVotes() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not voting session ended");
        uint256 _winningProposalId;
        for (uint256 p = 0; p < proposalsArray.length; p++) {
            if (proposalsArray[p].voteCount > proposalsArray[_winningProposalId].voteCount) {
                _winningProposalId = p;
            }
        }
        winningProposalId = _winningProposalId;

        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }

    /**
     * @notice Returns the winning Proposal
     */
    function getWinner() external view returns (Proposal memory) {
        require(workflowStatus == WorkflowStatus.VotesTallied, "Votes are not tallied yet");
        return proposalsArray[winningProposalId];
    }
}