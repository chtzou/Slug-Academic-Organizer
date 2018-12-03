import React, { Component } from "react";
import { getFromStorage } from './storage';
import '../styles/Major.css';
import LowerDiv from "./MajorComponents/LowerDiv";
import UpperDiv from "./MajorComponents/UpperDiv";
import Capstone from "./MajorComponents/Capstone";
import DC from "./MajorComponents/DC";
import Electives from "./MajorComponents/Electives";
import loader from './loader.svg';

/* 
 * This component displays the major requirement page for 
 * Computer Science B.S. . Eventually, we will create a process to 
 * generate layouts that work for all majors, but until we figure 
 * that out, a single major page will work.
 */

// Add dropdown to select major!!
export default class Major extends Component {
  // Initial Database -> Page setup -- Anthony

  constructor(props) {
    super(props);

    this.state = {
      userID: '',
      classes: [],
      isLoading: true,
    };
  }

  componentDidMount() {
    // Stolen from Michael's code: verifies the token and gets the userID
    const obj = getFromStorage('the_main_app');
    if (obj && obj.token) {
      const { token } = obj;
      // Verify token
      fetch('/api/account/verify?token=' + token)
        .then(res => res.json())
        .then(json => {
          // Store the userID in the state
          if (json.success) {
            this.setState({
              userID: json.userId,
            });
            if (json.userID !== "") {
              // Get the user classes from the database
              this.makePost(json.userId)
                .then(res => this.setState({ classes: res }))
                .catch(err => console.log(err));
            }else{
              this.setState({ isLoading: false });
            }
          }else{
            this.setState({ isLoading: false });
          }
        });
    }
  }

  // Post call to the database to get the user classes
  makePost = async (userID) => {
    const response = await fetch('/api/majorClasses', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userID: userID })
    });

    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);
    //console.log(body);
    this.setState({ isLoading: false });
    return body;
  };

  render() {
    if (this.state.isLoading) {
      return (
        <div className="loaderContainer" align="center"><img src={loader} className="App-loader" alt="loader" /></div>
      )
    }
    return (
      <div>
        <LowerDiv classes={this.state.classes} /> <br />
        <UpperDiv classes={this.state.classes} /> <br />
        <Electives classes={this.state.classes} /> <br />
        <div className="dcCapContainer">
          <div className="capComponent">
            <Capstone classes={this.state.classes} />
          </div>
          <div className="dcComponent">
            <DC classes={this.state.classes} />
          </div>
        </div>
      </div>
    );
  }
}