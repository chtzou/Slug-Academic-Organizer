import React, { Component } from "react";
import "../styles/GERequirements.css";
import { getFromStorage } from './storage';
import loader from './loader.svg';

class GERequirements extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ge: [], //server response,
      userID: '',
      classes: {},
      isLoading: true,
    };

    this.completed = this.completed.bind(this);
    this.completedClass = this.completedClass.bind(this);
  }

  //makes get request to server after the component mounts
  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ ge: res }))
      .catch(err => console.log(err));
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
            if (json.userId !== "") {
              this.makePost(json.userId)
                .then(res => this.setState({ classes: res }))
                .catch(err => console.log(err));
            }else{
              this.setState({ isLoading: false });
            }
          }else {
            this.setState({ isLoading: false });
          }
        });
    }
  }

  callApi = async () => {
    const response = await fetch("/api/GERequirements",
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  // Post call to the database to get the user classes
  makePost = async (userID) => {
    const response = await fetch('/api/geClasses', {
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

  completed = (ge) => {
    if (ge !== 'PR' && ge !== 'PE' && ge !== 'C2') {
      return (ge in this.state.classes);
    } else if (ge === 'C2') {
      return ('C' in this.state.classes || ge in this.state.classes);
    } else {
      if (ge === 'PR') {
        return ('PR-S' in this.state.classes || 'PR-E' in this.state.classes || 'PR-C' in this.state.classes);
      } else if (ge === 'PE') {
        return ('PE-E' in this.state.classes || 'PE-H' in this.state.classes || 'PE-T' in this.state.classes);
      }
    }
  }

  completedClass = (ge) => {
    if (this.completed(ge)) {
      if (ge !== 'PR' && ge !== 'PE' && ge !== 'C2') {
        return (this.state.classes[ge]);
      } else if (ge === "C2") {
        if (!(ge in this.state.classes)) {
          return (this.state.classes['C']);
        } else {
          return (this.state.classes['C2']);
        }
      } else {
        if (ge === 'PR') {
          if ('PR-S' in this.state.classes) {
            return this.state.classes['PR-S'];
          } else if ('PR-E' in this.state.classes) {
            return this.state.classes['PR-E'];
          } else {
            return this.state.classes['PR-C'];
          }
        } else if (ge === 'PE') {
          if ('PE-E' in this.state.classes) {
            return this.state.classes['PE-E'];
          } else if ('PE-H' in this.state.classes) {
            return this.state.classes['PE-H'];
          } else {
            return this.state.classes['PE-T'];
          }
        }
      }
    }
    return "Not Satisfied";
  }

  render() {
    if (this.state.isLoading) {
      return (
        <div className="loaderContainer" align="center"><img src={loader} className="App-loader" alt="loader" /></div>
      )
    }
    return (
      <div>
        <h3 className="pageTitle">GE Requirements</h3>
        <div className="grid-container">
          {this.state.ge.map((current, index) => {
            return (
              <div key={index} className={index / 2 === Math.floor(index / 2) ? 'a' : 'b'}>
                <div className={this.completed(current.geID) ? 'entry completed' : 'entry uncompleted'} key={index}>
                  <div className="category">
                    <h5>{current.geID}-{current.desc}</h5>
                  </div>
                  <div className="category">
                    <b>Credits: </b> {current.credits}
                  </div>
                  <div className="category">
                    <b>Satisfied By: </b>
                    {this.completedClass(current.geID)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default GERequirements;
