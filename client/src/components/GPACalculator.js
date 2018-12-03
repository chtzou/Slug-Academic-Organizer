import React, { Component } from "react";
import "../styles/GPACalculator.css";
import { Alert, Button } from "reactstrap";
import { getFromStorage } from "./storage";
import * as Grades from "./gradeConstants"
import * as Quarters from "./quarterConstants";

const cumulative = 0;
const quarterly  = 1;

class GPACalculator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      response: "", // Server response
      quarter: Quarters.Fall,
      year: 2018,
      gpa: "0.00",
      gpatype: cumulative, // 0: cumulative, 1: quarterly
      yearError: "",
      isLoading: false,
      userID: "",
      classes: {}
    };

    this.changeQuarter = this.changeQuarter.bind(this);
    this.changeYear = this.changeYear.bind(this);
    this.handleCalculate = this.handleCalculate.bind(this);
    this.changeGPAType = this.changeGPAType.bind(this);
    this.changeGPA = this.changeGPA.bind(this);
  }

  // User changes quarter form
  changeQuarter(event) {
    this.setState({ quarter: parseInt(event.target.value) });
  }

  // User enters a year
  changeYear(event) {
    this.setState({ year: parseInt(event.target.value) });
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

  //GPA is updated
  changeGPA(event) {
    let newGPA = 0.0;
    let total = 0;
    let achieved = 0;
    let gpaCredits = [4.0, 4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.7, 1.3, 1.0, 0.7, 0.0];

    if (this.state.gpatype === cumulative) {
      let yearKeys = Object.keys(this.state.classes);
      for (let year = 0; year < yearKeys.length; year++) {
        for (let quarter = 0; quarter < 4; quarter++) {
          let currentQuarter = this.state.classes[yearKeys[year]][quarter];

          for (let classI = 0; classI < currentQuarter.length; classI++) {
            let userClass = currentQuarter[classI];
            let units = userClass.units;
            let grade = userClass.grade;

            if (grade !== Grades.W && grade !== Grades.uncompleted && grade !== Grades.NP && grade !== Grades.P) {
              total += units;
              achieved = achieved + gpaCredits[grade] * units;
            }
          }
        }
      }
      if(total !== 0){
        newGPA = achieved / total;
      }
    } else if (this.state.gpatype === quarterly) {
      if (this.state.year in this.state.classes) {
        let quarter = this.state.classes[this.state.year][this.state.quarter];
        console.log(quarter);

        for (let classI = 0; classI < quarter.length; classI++) {
          let userClass = quarter[classI];
          let units = userClass.units;
          let grade = userClass.grade;

          if (grade !== Grades.NP && grade !== Grades.W && grade !== Grades.P && grade !== Grades.uncompleted) {
            total += units;
            achieved = achieved + gpaCredits[grade] * units;
          }
        }
        if (total !== 0) {
          newGPA = achieved / total;
        }
      }
    }

    this.setState({ gpa: newGPA.toFixed(2) });
  }

  // Form submission "Calculate"->pull request from server
  handleCalculate(event) {
    this.changeGPA(event);
  }

  // User selects GPA type
  changeGPAType(event) {
    this.setState({ gpatype: parseInt(event.target.value) });
  }

  render() {
    return (
      <div className="GPACalculator">
        <header className="GPACalculator-header">
          <div className="input">
            <form id="gpaform" onSubmit={this.handleCalculate}>
              <div className="GPAInfo">
                <div className="title">
                  <h4>GPA Calculator</h4>
                </div>
                <div className="gpatype">
                  <select
                    value={this.state.gpatype}
                    onChange={this.changeGPAType}
                    className="gpatype"
                  >
                    <option value="0">Cumulative</option>
                    <option value="1">Quarterly</option>
                  </select>
                  <div className="quarter">
                    <select
                      value={this.state.quarter}
                      onChange={this.changeQuarter}
                      className="quarter"
                      disabled={this.gpatype === 0}
                    >
                      <option value="0" disabled={this.state.gpatype === 0}>
                        Fall
                      </option>
                      <option value="3" disabled={this.state.gpatype === 0}>
                        Winter
                      </option>
                      <option value="2" disabled={this.state.gpatype === 0}>
                        Spring
                      </option>
                      <option value="1" disabled={this.state.gpatype === 0}>
                        Summer
                      </option>
                    </select>
                    <div className="year">
                      <input
                        type="number"
                        value={this.state.year}
                        onChange={this.changeYear}
                        placeholder="Year"
                        disabled={this.state.gpatype === 0}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
            <div className="resultContainer">
              <div className="GPASubmitButton">
                <Button onClick={this.changeGPA}>Calculate</Button>
              </div>
              <div className="result">
                <h5>GPA: {this.state.gpa}</h5>
              </div>
            </div>
            <div className="errors">
              {this.state.yearError.length !== 0 && (
                <Alert color="warning">
                  <b>{this.state.yearError}</b>
                </Alert>
              )}
            </div>
          </div>
        </header>
      </div>
    );
  }
}

export default GPACalculator;
