import React, { useRef, useEffect, useState } from "react";

const Proposals = (props) => {
  const state = props.state;
  const workflow = props.workflow;
  const inputRef = useRef(null);
  const [proposalArray, setProposalArray] = useState([]);
  const [proposalAdded, setProposalAdded] = useState(false);

  const getProposal = async (id) => {
    return await state.contract.methods.proposalsArray(id).call();
  };

  const addProposal = async () => {
      await state.contract.methods.addProposal(inputRef.current.value).send({ from: state.accounts[0] });
  };

  const proposalButton = () => {
    if (workflow === 1)
      return (<button onClick={addProposal}>Register</button>);
    else return ("");
  };

  const voteForProposal = async (id) => {
    try {
      await state.contract.methods.setVote(id).send({ from: state.accounts[0] });
      setProposalAdded(true);
    } catch (error) {
      console.log(error);
    }
  };

  const voteButton = (id) => {
    if (workflow === 1) return;
    else if (workflow === 3)
      return (<button onClick={() => {voteForProposal(id)}}>Vote for this one</button>);
  };

  const proposalEvent = async (error) => {
    if (!error) {
      setProposalAdded(true);
    } else console.log(error);
  };

  async function get() {
    await state.contract.events.ProposalRegistered(null, proposalEvent);
    await state.contract.getPastEvents("ProposalRegistered", { fromBlock: 0 }, 
    async function (error, events) {
        let result = [];
        events.map((index) => {
            const id = index.returnValues._proposalId;
            result.push(getProposal(id));
        });
        let result2 = [];
        await Promise.all(result).then((res) => {result2 = res;});
        setProposalArray(result2);
      }
    );
  }

  useEffect(() => {
    get();
    setProposalAdded(false);
  }, [proposalAdded]);

  return (
    <div>
      <h4>Add your proposal :</h4>
      <input type="text" ref={inputRef}/>{proposalButton()}<br />
      <h4>Proposals you can vote for :</h4>
      {proposalArray.map((proposal, id) => {
        return (
          <div key={id}>
            {`Votes : ${proposal.voteCount} ||
            ${proposal.description}`} 
            {voteButton(id)}<br />
          </div>);
      })}
    <br />
    </div>
  );
};

export default Proposals;