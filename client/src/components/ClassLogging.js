import React, { Component } from "react";
import "./ClassLogging.css";
import ClassInput from "./ClassInput";
import {getFromStorage} from './storage';

class ClassLogging extends Component {
  constructor(props) {
    super(props);
    this.state = {
      response: "", //server response
      classes: [],
      isLoading: false,
      token: ''
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.delete = this.delete.bind(this);
  };

  delete(_id, idx) {
    this.deletePost(_id)
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
      var newClasses = this.state.classes;
      newClasses.splice(idx, 1);
      this.setState({classes: newClasses});
  };

  handleSubmit(newClass, _id) {
    console.log(_id);
    var newClasses = this.state.classes;
    newClasses.push({courseID: newClass, _id: _id});
    this.setState({classes: newClasses});
    console.log(newClasses);
  };

  //makes get request to server after the component mounts
  componentDidMount() {
    const obj = getFromStorage('the_main_app');
    if (obj && obj.token) {
      const { token } = obj;
      // Verify token
      fetch('/api/account/verify?token=' + token)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            this.setState({
              token,
              isLoading: false
            });
              this.makePost(token)
                .then(res => this.setState({ classes: res }))
                .catch(err => console.log(err));
          } else {
            this.setState({
              isLoading: false,
            });
          }
        });
    } else {
      this.setState({
        isLoading: false,
      });
    }
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

  makePost = async (token) => {
    const response = await fetch('/api/userClasses', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({token: token})
    });

    const body = await response.json();

    if(response.status !== 200) throw Error(body.message);

    console.log(body);

    return body;
  };

  deletePost = async (_id) => {
    const response = await fetch('/api/deleteClass', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({_id: _id})
    });

    const body = await response.json();

    if(response.status !== 200) throw Error(body.message);

    console.log(body);

    return body;
  };

  render() {
    if(!this.state.isLoading){
      return (
        <div className="App">
          <div className="wrapper">
            <div className="one">
              <ClassInput onSubmit = {this.handleSubmit} token = {this.state.token}/>
            </div>
            <div className="two">
              <table className="classLog">
                <thead>
                  <tr>
                    <th>
                      Class
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.classes.map((d, idx) => {
                    return (
                      <tr key={idx}>
                        <td>
                          {d.courseID}
                        </td>
                        <td>
                          <button key={idx} onClick={() => {this.delete(d._id, idx)}}>Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }else{
      return(
        <div className="Loading">
          <p> loading ... </p>
        </div>
      );
    }
  }
};
export default ClassLogging;