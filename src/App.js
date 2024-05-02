import React from "react";
import lottery from "./lottery";
import web3 from "./web3";
import "./App.css";

class App extends React.Component {
  state = {
    manager: "",
    players: [],
    balance: "",
    value: '',
    message: '',
    darkMode: false // Toggle for dark mode
  };

  async componentDidMount() {
    try {
      await this.updateState();
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.players.length !== this.state.players.length) {
      // Fetch updated data if number of players changes
      this.updateState();
    }
  }

  updateState = async () => {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);

    this.setState({ manager, players, balance, loading: false });
  }

  onSubmit = async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    this.setState({ message: 'Waiting on transaction success' });

    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether')
    });

    this.setState({ message: 'You have been entered' });
    // Update state after transaction
    await this.updateState();
  }

  onClick = async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    this.setState({ message: 'Waiting on transaction success' });

    const manager = await lottery.methods.manager().call();
    if (accounts[0] !== manager) {
      this.setState({ message: 'Only the manager can pick a winner' });
      return;
    }

    await lottery.methods.pickWinner().send({
      from: accounts[0],
    });

    this.setState({ message: 'A winner has been picked' });
    // Update state after transaction
    await this.updateState();
  }

  toggleDarkMode = () => {
    this.setState(prevState => ({ darkMode: !prevState.darkMode }));
  }

  render() {
    const { manager, loading, error, darkMode } = this.state;
    const bodyClass = darkMode ? "dark-mode" : "";

    return (
      <div className={bodyClass}>
        <h2 className="title">Lottery Contract</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error">Error: {error}</p>
        ) : (
          <div className="flex">
            <p className="info">This contract is managed by <span className="manager"> {manager}</span></p>
            <p className="info">There are currently {this.state.players.length} people entered competing to win {web3.utils.fromWei(this.state.balance, 'ether')} ether!</p>
          </div>
        )}
        <div className="flex">
          <form onSubmit={this.onSubmit}>
            <h4 className="action">Want to try your luck?</h4>
            <div className="form-group">
              <label className="label">Amount of ether to enter</label> &nbsp;
              <input className="input" value={this.state.value} onChange={event => this.setState({ value: event.target.value })} />
            </div>
            <button className="button">Enter</button>
          </form>

          <div className="action-container">
            <h4 className="action">Ready to pick a winner?</h4>
            <button className="button" onClick={this.onClick}>Pick a winner!</button>
          </div>
        </div>

        <h1 className="message">{this.state.message}</h1>
      </div>
    );
  }
}

export default App;
