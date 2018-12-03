import React, { Component } from "react";
import "../styles/ClassLogging.css";
import { getFromStorage } from "./storage";
import { Button, UncontrolledCollapse } from "reactstrap";
import SearchCourse from "./SearchCourse";
import loader from './loader.svg';
import * as Grades from "./gradeConstants";
import * as Quarters from './quarterConstants';

class ClassLogging extends Component {
  constructor(props) {
    super(props);
    this.state = {
      response: "", //server response
      classes: {},
      isLoading: true,
      userID: ""
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.delete = this.delete.bind(this);
  }

  // Send request to server to delete the class
  delete(_id, idx, quarter, year) {
    this.deletePost(_id)
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
    //remove the class from the state
    var newClasses = this.state.classes;
    newClasses[year][quarter].splice(idx, 1);
    const size =
      newClasses[year][0].length +
      newClasses[year][1].length +
      newClasses[year][2].length +
      newClasses[year][3].length;
    if (size === 0) {
      delete newClasses[year];
    }
    this.setState({ classes: newClasses });
  }

  // Called by SearchCourse component when there's a submit, basically adds the new class to the state
  handleSubmit(newClass, _id, quarter, year, grade) {
    var newClasses = this.state.classes;
    if (year in newClasses) {
      newClasses[year][quarter].push({ courseID: newClass, _id: _id, grade: grade });
    } else {
      newClasses[year] = [[], [], [], []];
      newClasses[year][quarter].push({ courseID: newClass, _id: _id, grade: grade });
    }
    this.setState({ classes: newClasses });
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
            });
            // Get the user classes from the database
            this.makePost(json.userId)
              .then(res => this.setState({ classes: res }))
              .catch(err => console.log(err));
          }else{
            this.setState({ isLoading: false });
          }
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
    this.setState({ isLoading: false });
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  // Post to delete the selected class from the server
  deletePost = async _id => {
    const response = await fetch("/api/deleteClass", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ _id: _id })
    });

    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  convertGrade(grade) {
    switch (grade) {
      case Grades.Aplus:
        return "A+";
      case Grades.A:
        return "A";
      case Grades.Aminus:
        return "A-";
      case Grades.Bplus:
        return "B+";
      case Grades.B:
        return "B";
      case Grades.Bminus:
        return "B-";
      case Grades.Cplus:
        return "C+";
      case Grades.C:
        return "C";
      case Grades.Cminus:
        return "C-";
      case Grades.Dplus:
        return "D+";
      case Grades.D:
        return "D";
      case Grades.Dminus:
        return "D-";
      case Grades.F:
        return "F";
      case Grades.W:
        return "W";
      case Grades.uncompleted:
        return "N/A";
      case Grades.P:
        return "Pass";
      case Grades.NP:
        return "No Pass";
      default:
        return "error";
    }
  }

  // Updates the grade in the database and displays it on page
  changeGrade = (_id, idx, quarter, year) => (event) => {
    let classes = this.state.classes;
    classes[year][quarter][idx].grade = parseInt(event.target.value);
    this.editPost({ _id: _id, grade: parseInt(event.target.value) });
    this.setState({ classes: classes });
  }

  // Calls edit post API to update the class' grade in the database
  editPost = async data => {
    const response = await fetch("/api/editGrade", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ _id: data._id, grade: data.grade })
    });

    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    //console.log(body);
    return body;
  };

  render() {
    if (this.state.isLoading) {
      return (
        <div className="loaderContainer" align="center"><img src={loader} className="App-loader" alt="loader" /></div>
      )
    }
    if (!this.state.isLoading) {
      return (
        <div className="logContainer">
          <div className="searchCol">
            <SearchCourse
              onSubmit={this.handleSubmit}
              userID={this.state.userID}
            />
          </div>
          <div className="logCol">
            {Object.keys(this.state.classes)
              .slice(0)
              .reverse()
              .map((year, idx) => {
                return (
                  <>
                    <div key={idx} className="classLog">
                      <div key={idx}>
                        <Button className="yearButton" id={"id" + year + idx}>{year}</Button>
                      </div>
                      <UncontrolledCollapse toggler={"id" + year + idx}>
                        {this.state.classes[year].map((i, quarter) => {
                          let currentQuarter = this.state.classes[year][quarter];
                          return (
                            <div key={quarter}>
                              <div className="quarter" key={quarter}>
                                {quarter === Quarters.Fall && currentQuarter.length !== 0 && (<div align="center"><b>Fall</b></div>)}
                                {quarter === Quarters.Summer && currentQuarter.length !== 0 && (<div align="center"><b>Summer</b></div>)}
                                {quarter === Quarters.Spring && currentQuarter.length !== 0 && (<div align="center"><b>Spring</b></div>)}
                                {quarter === Quarters.Winter && currentQuarter.length !== 0 && (<div align="center"><b>Winter</b></div>)}
                              </div>
                              <div className={currentQuarter.length !== 0 ? 'quarterClassContainer' : 'empty'}>
                                {currentQuarter.map(
                                  (userClass, classIdx) => {
                                    return (
                                      <div className="classContainer" key={classIdx}>
                                        <div className="courseID" key={classIdx}>
                                          {userClass.courseID}
                                        </div>
                                        <div className="gradeSelect">
                                          {"Grade: "}
                                          <select
                                            value={userClass.grade}
                                            onChange={this.changeGrade(userClass._id, classIdx, quarter, year)}
                                            className="grade"
                                          >
                                            <option value={Grades.Aplus}> A+ </option>
                                            <option value={Grades.A}> A </option>
                                            <option value={Grades.Aminus}> A- </option>
                                            <option value={Grades.Bplus}> B+ </option>
                                            <option value={Grades.B}> B </option>
                                            <option value={Grades.Bminus}> B- </option>
                                            <option value={Grades.Cplus}> C+ </option>
                                            <option value={Grades.C}> C </option>
                                            <option value={Grades.Cminus}> C- </option>
                                            <option value={Grades.Dplus}> D+ </option>
                                            <option value={Grades.D}> D </option>
                                            <option value={Grades.Dminus}> D- </option>
                                            <option value={Grades.F}> F </option>
                                            <option value={Grades.W}> W </option>
                                            <option value={Grades.uncompleted}> Not Completed </option>
                                            <option value={Grades.P}> Pass </option>
                                            <option value={Grades.NP}> No Pass </option>
                                          </select>
                                        </div>
                                        <div className="deleteButton">
                                          <Button key={classIdx} onClick={() => { this.delete(userClass._id, classIdx, quarter, year); }}>
                                            Delete
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </UncontrolledCollapse>
                    </div>
                    <br />
                  </>
                );
              })}
          </div>
        </div >
      );
    } else {
      return (
        <div className="Loading">
          <p> loading ... </p>
        </div>
      );
    }
  }
}
export default ClassLogging;
