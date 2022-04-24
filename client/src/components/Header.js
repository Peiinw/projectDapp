import React, { useEffect, useState } from "react";

const Header = (props) => {
  const state = props.state;
  const workflow = props.workflow;
  const setWorkflow = props.setWorkflow;
  const [owner, setOwner] = useState("");
  const [winnerProposal, setWinnerProposal] = useState(null);
  const [connectedWallet, setConnectedWallet] = useState("");

  const getWorkflow = async () => {
    const step = await state.contract.methods.workflowStatus().call();
    setWorkflow(parseInt(step));
  };

  const getWorkflowState = function () {
    if (workflow === 0) return "Registering voters";
    else if (workflow === 1) return "Proposal registration has started";
    else if (workflow === 2) return "Proposal registration has ended";
    else if (workflow === 3) return "Voting session has started";
    else if (workflow === 4) return "Voting session has ended";
    else if (workflow === 5) return "Vote are tallied";
  };

  const getOwner = async () => {
    const owner = await state.contract.methods.owner().call();
    if (state.accounts[0] === owner) setOwner(`${owner}`);
    else setOwner(owner);
  };

  const getWinner = async () => {
    if (workflow === 5) {
      let id = await state.contract.methods.winningProposalId().call();
      if (id) {
        let winningId = await state.contract.methods.getWinner().call();
        winningId = id;
        setWinnerProposal(winningId);
      }
    }
  };

  useEffect(() => {
    getOwner();
    getWorkflow();
    getWinner();

    setConnectedWallet(`${state.accounts[0]}`);
  }, [workflow, state]);

  return (
    <div>
      Connected wallet : {connectedWallet}<br />
      Workflow : {getWorkflowState()}<br />
      {winnerProposal !== null ? `Winner ID = ${winnerProposal}` : ""}<br /><br />
    </div>
  );
};

export default Header;