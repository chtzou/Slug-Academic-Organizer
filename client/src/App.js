import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import ClassLogging from "./components/ClassLogging";
import GERequirements from "./components/GERequirements";
import Calendar from "./components/Calendar";
import NavBar from "./components/NavBar";
import SignIn from "./components/Home";
import Grades from "./components/Grades";
import Major from "./components/Major";
import "./App.css";
import "./styles/NavBar.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      response: "" //server response
    };
  }

  render() {
    return (
      //this lets connect to different components of our site
      <Router>
        <div className="container main">
          <header>
            <NavBar />
          </header>
          <div className="content">
            <Switch>
              <Route exact path="/" component={SignIn} />
              <Route path="/logging" component={ClassLogging} />
              <Route path="/grades" component={Grades} />
              <Route path="/major" component={Major} />
              <Route path="/ge" component={GERequirements} />
			        <Route path="/calendar" component={Calendar} />
			        <Route path="/account" component={Account} />
			        <Redirect from="*" to="/" />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}
export default App;
