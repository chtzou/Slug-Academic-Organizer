import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../styles/ClassInput.css";
import "rc-time-picker/assets/index.css";
import TimePicker from "rc-time-picker";

const format = "h:mm a";

class ClassInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      response: "", //server response
      class: "", //class value from form
      //meeting days for class
      M: false,
      Tu: false,
      W: false,
      Th: false,
      F: false,
      //starting and ending of class
      startTime: undefined,
      endTime: undefined,
      location: "", //location of class
      section: false, //if enrolling in a section
      //section info
      sM: false,
      sTu: false,
      sW: false,
      sTh: false,
      sF: false,
      sStartTime: undefined,
      sEndTime: undefined,
      sLocation: ""
    };

    this.changeClass = this.changeClass.bind(this);
    this.changeDays = this.changeDays.bind(this);
    this.changeStartTime = this.changeStartTime.bind(this);
    this.changeEndTime = this.changeEndTime.bind(this);
    this.changeLocation = this.changeLocation.bind(this);
    this.changeSDays = this.changeSDays.bind(this);
    this.changeSStartTime = this.changeSStartTime.bind(this);
    this.changeSEndTime = this.changeSEndTime.bind(this);
    this.changeSLocation = this.changeSLocation.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.sectionToggle = this.sectionToggle.bind(this);
  }

  //user enters class value
  changeClass(event) {
    this.setState({ class: event.target.value.trim() });
  }

  //user chooses meeting days
  changeDays(event) {
    if (event.target.value === "M") {
      this.setState(prevState => ({
        M: !prevState.M
      }));
    } else if (event.target.value === "Tu") {
      this.setState(prevState => ({
        Tu: !prevState.Tu
      }));
    } else if (event.target.value === "W") {
      this.setState(prevState => ({
        W: !prevState.W
      }));
    } else if (event.target.value === "Th") {
      this.setState(prevState => ({
        Th: !prevState.Th
      }));
    } else if (event.target.value === "F") {
      this.setState(prevState => ({
        F: !prevState.F
      }));
    }
  }

  //user enters start time
  changeStartTime(value) {
    this.setState({ startTime: value });
  }

  //user enters end time
  changeEndTime(value) {
    this.setState({ endTime: value });
  }

  //user enters location
  changeLocation(event) {
    this.setState({ location: event.target.value });
  }

  //user enters section days
  changeSDays(event) {
    if (event.target.value === "M") {
      this.setState(prevState => ({
        sM: !prevState.sM
      }));
    } else if (event.target.value === "Tu") {
      this.setState(prevState => ({
        sTu: !prevState.sTu
      }));
    } else if (event.target.value === "W") {
      this.setState(prevState => ({
        sW: !prevState.sW
      }));
    } else if (event.target.value === "Th") {
      this.setState(prevState => ({
        sTh: !prevState.sTh
      }));
    } else if (event.target.value === "F") {
      this.setState(prevState => ({
        sF: !prevState.sF
      }));
    }
  }

  //user enters section start time
  changeSStartTime(value) {
    this.setState({ sStartTime: value });
  }

  //user enters section end time
  changeSEndTime(value) {
    this.setState({ sEndTime: value });
  }

  //user enters section location
  changeSLocation(event) {
    this.setState({ sLocation: event.target.value });
  }

  sectionToggle(event) {
    this.setState(prevState => ({
      section: !prevState.section
    }));
  }

  //form submission->post request to server
  handleSubmit(event) {
    console.log(this.state.section);
    this.submitClass({
      class: this.state.class,
      M: this.state.M,
      Tu: this.state.Tu,
      W: this.state.W,
      Th: this.state.Th,
      F: this.state.F,
      startTime: this.state.startTime,
      endTime: this.state.endTime,
      location: this.state.location,
      section: this.state.section,
      sM: this.state.sM,
      sTu: this.state.sTu,
      sW: this.state.sW,
      sTh: this.state.sTh,
      sF: this.state.sF,
      sStartTime: this.state.sStartTime,
      sEndTime: this.state.sEndTime,
      sLocation: this.state.sLocation
    }) //send all form data to server
      .then(res =>
        this.setState({
          response: res.express,
          class: "",
          M: false,
          Tu: false,
          W: false,
          Th: false,
          F: false,
          startTime: undefined,
          endTime: undefined,
          location: "",
          section: false,
          sM: false,
          sTu: false,
          sW: false,
          sTh: false,
          sF: false,
          sStartTime: undefined,
          sEndTime: undefined,
          sLocation: ""
        })
      ) //then reset all states
      .catch(err => console.log(err));
    event.preventDefault(); //prevent default page reload
  }

  //make post call to server
  submitClass = async data => {
    var json;
    if (data.section) {
      json = JSON.stringify({
        class: data.class,
        M: data.M,
        Tu: data.Tu,
        W: data.W,
        Th: data.Th,
        F: data.F,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        section: data.section,
        sM: data.sM,
        sTu: data.sTu,
        sW: data.sW,
        sTh: data.sTh,
        sF: data.sF,
        sStartTime: data.sStartTime,
        sEndTime: data.sEndTime,
        sLocation: data.sLocation
      });
    } else {
      json = JSON.stringify({
        class: data.class,
        M: data.M,
        Tu: data.Tu,
        W: data.W,
        Th: data.Th,
        F: data.F,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        section: data.section
      });
    }
    const response = await fetch("/api/submitClass", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: json
    });

    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  render() {
    return (
      <div className="classInput">
        <header className="classInput-header">
          <div className="input">
            <form id="classform" onSubmit={this.handleSubmit}>
              <div className="classInfo">
                <div className="title">
                  <b>Class</b>
                </div>
                <div className="class">
                  <input
                    type="text"
                    value={this.state.class}
                    onChange={this.changeClass}
                  />
                </div>

                <div className="meetingDays">
                  <table className="days">
                    <thead>
                      <tr className="head">
                        <th>M</th>
                        <th>Tu</th>
                        <th>W</th>
                        <th>Th</th>
                        <th>F</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <input
                            type="checkbox"
                            value="M"
                            onChange={this.changeDays}
                            checked={this.state.M}
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            value="Tu"
                            onChange={this.changeDays}
                            checked={this.state.Tu}
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            value="W"
                            onChange={this.changeDays}
                            checked={this.state.W}
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            value="Th"
                            onChange={this.changeDays}
                            checked={this.state.Th}
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            value="F"
                            onChange={this.changeDays}
                            checked={this.state.F}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="time">
                  Start Time
                  <br />
                  <TimePicker
                    showSecond={false}
                    onChange={this.changeStartTime}
                    value={this.state.startTime}
                    format={format}
                    use12Hours
                    minuteStep={5}
                  />
                </div>
                <div className="time">
                  End Time
                  <br />
                  <TimePicker
                    showSecond={false}
                    value={this.state.endTime}
                    onChange={this.changeEndTime}
                    format={format}
                    use12Hours
                    minuteStep={5}
                  />
                </div>
                <div className="location">
                  Location
                  <br />
                  <input
                    type="text"
                    value={this.state.location}
                    onChange={this.changeLocation}
                  />
                </div>
                <div className="sectionToggle">
                  Section
                  <input
                    type="checkbox"
                    onChange={this.sectionToggle}
                    checked={this.state.section}
                  />
                </div>
              </div>
              {/*shows only if user has selected section*/}
              {this.state.section && (
                <div className="sectionForm">
                  <div className="meetingDays">
                    <b>Section</b>
                    <table className="days">
                      <thead>
                        <tr className="head">
                          <th>M</th>
                          <th>Tu</th>
                          <th>W</th>
                          <th>Th</th>
                          <th>F</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <input
                              type="checkbox"
                              value="M"
                              onChange={this.changeSDays}
                              checked={this.state.sM}
                            />
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              value="Tu"
                              onChange={this.changeSDays}
                              checked={this.state.sTu}
                            />
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              value="W"
                              onChange={this.changeSDays}
                              checked={this.state.sW}
                            />
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              value="Th"
                              onChange={this.changeSDays}
                              checked={this.state.sTh}
                            />
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              value="F"
                              onChange={this.changeSDays}
                              checked={this.state.sF}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="time">
                    Start Time
                    <br />
                    <TimePicker
                      showSecond={false}
                      onChange={this.changeSStartTime}
                      format={format}
                      value={this.state.sStartTime}
                      use12Hours
                      minuteStep={5}
                    />
                  </div>
                  <div className="time">
                    End Time
                    <br />
                    <TimePicker
                      showSecond={false}
                      onChange={this.changeSEndTime}
                      value={this.state.sEndTime}
                      format={format}
                      use12Hours
                      minuteStep={5}
                    />
                  </div>
                  <div className="location">
                    Location
                    <br />
                    <input
                      type="text"
                      value={this.state.sLocation}
                      onChange={this.changeSLocation}
                    />
                  </div>
                </div>
              )}
              <div className="submit">
                <input type="submit" className="submit" value="Submit" />
              </div>
            </form>
          </div>
          <li>
            <Link to="/signin">Account Page</Link>
          </li>
        </header>
      </div>
    );
  }
}

export default ClassInput;
