import React, { useEffect } from "react";

const Workflow = (props) => {
  const state = props.state;
  const workflow = props.workflow;
  const setWorkflow = props.setWorkflow;
  const initialWorkflow = props.initialWorkflow;

  const changeWorkflow = async () => {
    try {
      if (initialWorkflow === 0) {
        await state.contract.methods.startProposalsRegistering().send({ from: state.accounts[0] });
      } else if (initialWorkflow === 1)
        await state.contract.methods.endProposalsRegistering().send({ from: state.accounts[0] });
      else if (initialWorkflow === 2)
        await state.contract.methods.startVotingSession().send({ from: state.accounts[0] });
      else if (initialWorkflow === 3)
        await state.contract.methods.endVotingSession().send({ from: state.accounts[0] });
      else if (initialWorkflow === 4)
        await state.contract.methods.tallyVotes().send({ from: state.accounts[0] });
    } catch (error) {
      console.log(error);
    }
  };

  const workflowEvent = (error, result) => {
    if (!error) {
      setWorkflow(result.returnValues._newStatus);
    } else console.log(error);
  };

  async function get() {
    await state.contract.events.WorkflowStatusChange(null, workflowEvent);
  };

  const workflowButton = () => {
    if (initialWorkflow === workflow && state.owner === state.accounts[0])
      return (<button onClick={changeWorkflow}>Next workflow step</button>);
    else return ("");
  };

  useEffect(() => {
    get();
  }, []);

  return (
    <div>{props.Title} {workflowButton()}</div>
  );
};

export default Workflow;