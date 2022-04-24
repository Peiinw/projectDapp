import React, { useEffect, useState, Fragment } from "react";
import VotingContract from "./contracts/Voting.json";
import Web3 from "web3";
import Header from "./components/Header.js";
import Whitelist from "./components/Whitelist.js";
import Workflow from "./components/Workflow";
import Proposals from "./components/Proposals";

import "./App.css";

function App() {
  const [state, setState] = useState({ web3: null, accounts: null, contract: null, owner: null });
  const [workflow, setWorkflow] = useState("");

  const initState = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = VotingContract.networks[networkId];
      const instance = new web3.eth.Contract(
        VotingContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      const owner = await instance.methods.owner().call();

      setState({ web3: web3, accounts: accounts, contract: instance, owner: owner });

    } catch (error) {
      alert(`Failed to load web3, accounts, or contract. Check console for details.`);
      console.error(error);
    }
  };

  useEffect(() => {
    window.ethereum.on("accountsChanged", async () => {
      initState();
    });

    initState();
  }, []);

  if (!state.web3) {
    return (<div>You are not connected.</div>)
  } else
    return (
        <div className="App-header">
          <Header state={state} workflow={workflow} setWorkflow={setWorkflow}/>
          <Whitelist state={state} workflow={workflow}/>
          <Workflow state={state} workflow={workflow} setWorkflow={setWorkflow} initialWorkflow={0} 
            Title="• Start proposal registering"/>
          <Workflow state={state} workflow={workflow} setWorkflow={setWorkflow} initialWorkflow={1} 
            Title="• End proposal registering"/>
          <Proposals state={state} workflow={workflow}/>
          <Workflow state={state} workflow={workflow} setWorkflow={setWorkflow} initialWorkflow={2} 
            Title="• Start voting"/>
          <Workflow state={state} workflow={workflow} setWorkflow={setWorkflow} initialWorkflow={3} 
            Title="• End voting"/><br/ >
          <Workflow state={state} workflow={workflow} setWorkflow={setWorkflow} initialWorkflow={4} 
            Title="• Tally votes"/>
        </div>
    );
}

export default App;