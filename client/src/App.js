import React, { Component } from "react";
import "./App.css";
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import ClassInput from "./components/ClassInput";
import Home from "./components/Home";
import Search from "./components/Search";
import Error from "./components/Error";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      response: "" //server response
    };
  }

  //makes get request to server after the component mounts
  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch("/");
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  render() {
    return (
	//this lets connect to different components of our site
      <BrowserRouter>
        <div>
          <Switch>
            <Route path="/" component={ClassInput} exact />
			<Route path="/signin" component={Home} />
			<Route path="/search" component={Search} />
			<Route component={Error} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
};
export default App;
