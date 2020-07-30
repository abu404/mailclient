import React from 'react';
import { Spinner } from 'reactstrap';
import {CONNECT_URL} from '../data/Constants'

const inputStyles = {
  input: {
    margin: 10
  }
}

export default class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      host: '',
      port: '993',
      user: '',
      pass: '',
      dataLoading: false
    };

  }

  handleHostChange = (event) => {
    this.setState({ host: event.target.value });
  }
  handlePortChange = (event) => {
    this.setState({ port: event.target.value || this.state.port });
  }
  handleUserChange = (event) => {
    this.setState({ user: event.target.value });
  }
  handlePasswordChange = (event) => {
    this.setState({ pass: event.target.value });
  }
  resetState = () => {
    this.setState({ host: '', port: 993, user: '', pass: '', dataLoading: false }, () => console.log("Restting "))
  }
  handleSubmit = (event) => {
    event.preventDefault();

    const { host, port, user, pass } = this.state
    if (host === '') {
      alert("Invalid Host")
      return;
    }

    if (port === '') {
      alert("Invalid Port")
      return;
    }

    if (user === '') {
      alert("Invalid Email")
      return
    }
    if (pass === '') {
      alert("Invalid Password")
      return
    }
    // validations

    alert(`host=${host} port=${port} user=${user} pass=${pass}`)
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      host: this.state.host,
      port: this.state.port,
      user: this.state.user,
      pass: this.state.pass
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      // redirect: 'follow'
    };
    this.setState({ dataLoading: true })
    fetch(CONNECT_URL, requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result)
        localStorage.setItem('tk', result.data.token)
        this.props.history.push('/list')
      })
      .catch(error => {
        alert("Login error...")
      });
    this.resetState();


  }

  render() {
    return (
      <React.Fragment>
        {this.state.dataLoading ? <Spinner /> :
          <div className="login-container">
            <form onSubmit={this.handleSubmit} method="POST">
              {/* <div className="login-form-gro"> */}
                <input type="text" name="host" placeholder="Enter Host" style={inputStyles.input} value={this.state.host} onChange={this.handleHostChange} />
                <input type="text" name="port" placeholder="Enter Port" style={inputStyles.input} value={this.state.host ? this.state.port : ''} onChange={this.handlePortChange} />
                <input type="email" name="user-email" placeholder="Enter Email" style={inputStyles.input} value={this.state.user} onChange={this.handleUserChange} />
                <input type="password" name="pass" placeholder="Enter Password" style={inputStyles.input} value={this.state.pass} onChange={this.handlePasswordChange} />
                <button type="submit">Login</button>
              {/* </div> */}

            </form>
           </div>
          }

      </React.Fragment>
    );
  }
}