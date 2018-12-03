import React, { Component } from 'react';
import {Progress, Button} from 'reactstrap';
import { getFromStorage } from "./storage";
import  "../styles/PNPProgress.css";
import { W, uncompleted, P, NP} from  "./gradeConstants";

class PNPProgress extends Component{
  constructor(props) {
    super(props);
    this.state = {
      response: "", // Server response
      isLoading: false,
      userID: "",
      classes: {},
      percentage: 0
    };

    this.calculatePNP = this.calculatePNP.bind(this);
  }

  // Makes get request to server after the component mounts
  componentDidMount() {
    // Stolen from Michael's code: verifies the token and gets the userID
    const obj = getFromStorage("the_main_app");
    if (obj && obj.token) {
      const { token } = obj;
      // Verify token
      fetch("/api/account/verify?token=" + token)
        .then(res => res.json())
        .then(json => {
          // Store the userID in the state
          if (json.success) {
            this.setState({
              userID: json.userId,
              isLoading: false
            });
            // Get the user classes from the database
            this.makePost(json.userId)
              .then(res => this.setState({ classes: res }))
              .catch(err => console.log(err));
          } else {
            this.setState({
              isLoading: false
            });
          }
        });
    } else {
      this.setState({
        isLoading: false
      });
    }
  }

  // Post call to the database to get the user classes
  makePost = async userID => {
    const response = await fetch("/api/userClasses", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userID: userID })
    });

    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  calculatePNP(){
    //pull all classes taken by user in database
    //loop through and sum all classes/classes taken pnp
    //return ((pnp / all classes) * 100).toFixed(1)
    var pnp = 0;
    var total = 0;
    var yearKeys = Object.keys(this.state.classes);

    for(let year = 0; year < yearKeys.length; year++){

      for(let quarter = 0; quarter < 4; quarter++){
        let currentQuarter = this.state.classes[yearKeys[year]][quarter];
        for(let classI = 0; classI < currentQuarter.length; classI++){
          let currentClass = currentQuarter[classI];
          if(currentClass.grade !== W && currentClass.grade !== uncompleted  && currentClass.grade !== NP){
            total+=currentClass.units;
          }
          if(currentClass.grade === P){
            pnp+=currentClass.units;
          }
        }
      }
    }
    if(total!==0){
      this.setState({ percentage: ((pnp / total) * 100).toFixed(2) });
    }
  }

  render() {
    return (
      <div>
        <div className="pnpContainer">
          <h4>Pass/No Pass Percentage</h4>
          <Progress className="pnpBar" value={this.state.percentage} max="25" />
        </div>
        <div className="resultContainer">
          <div>
            <Button className="calculatePNPButton" onClick={this.calculatePNP}>Calculate</Button>
          </div>
          <div className="result" align="center"><h5>{this.state.percentage}% of 25%</h5></div>
        </div>
      </div>
    );
  };
}
export default PNPProgress;
