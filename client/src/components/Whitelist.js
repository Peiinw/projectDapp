import React, { useRef, useEffect, useState } from "react";

const Whitelist = (props) => {
  const state = props.state;
  const workflow = props.workflow;
  const inputRef = useRef(null);
  const [voters, setVoters] = useState([]);
  const [voted, setVoted] = useState(false);

  const addToWhitelist = async (event) => {
      await state.contract.methods.addVoter(inputRef.current.value).send({ from: state.accounts[0] });
  };

  const whitelistButton = () => {
    if (workflow === 0 && state.owner === state.accounts[0])
        return (<button onClick={addToWhitelist}>Add</button>);
      else return ("");
  };

  const whitelistEvent = (error, result) => {
    if (!error) {
      const votersArray = voters;
      votersArray.push(result.returnValues._voterAddress);
      setVoters(votersArray);
      setVoted(true);
    } else console.log(error);
  };

  async function get() {
    await state.contract.events.VoterRegistered(null, whitelistEvent);
    await state.contract.getPastEvents("VoterRegistered",{ fromBlock: 0 },
      function (error, events) {
        let result = [];
        events.map((index) => {result.push(index.returnValues._voterAddress)});
        setVoters(result);
      }
    );
  }

  useEffect(() => {
    if (voted === false) 
    get();
    setVoted(false);
  }, [voted, state]);

  return (
    <div>
      <h4>Whitelist an address :</h4>
      <input type="text" ref={inputRef}/>{whitelistButton()}<br />
      <h4>Registered voters :</h4>
      {voters.length > 0 ? voters.map((address, index) => {
        return (
          <div key={index}>{address}</div>)}): ""}
    <br />      
    </div>
  );
};

export default Whitelist;