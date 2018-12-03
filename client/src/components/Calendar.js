import React, { Component } from "react";
import FullCalendar from "fullcalendar-reactwrapper";
import { getFromStorage } from "./storage";
import "../styles/Calendar.css";
import "../dist/fullcalendar.css";
import loader from './loader.svg';

/* Events are what we'll have to automatically sync w/ user
 * Uses v3 of fullCalendar
 * Calendar component is basic, but I showed how to use our
 * own custom css with it for now in ../styles/Calendar.css
 *
 * Reference:
 * https://github.com/sanjeev07/fullcalendar-reactWrapper
 * https://github.com/fullcalendar/fullcalendar
 */

export default class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mobileCheck: window.innerWidth < 1024,
      events: [],
      isLoading: true,
      userID: ""
    };
    this.updateMobileCheck = this.updateMobileCheck.bind(this);
  }

  componentDidMount() {
    //get userToken and return courses
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
            this.getCalendar(json.userId)
              .then(res => this.setState({ events: res }))
              .catch(err => console.log(err));
          }else{
            this.setState({ isLoading: false });
          }
        });
    }
    window.addEventListener("resize", this.updateMobileCheck);
  }

  updateMobileCheck() {
    if(this.state.mobileCheck !== (window.innerWidth <= 1024)){
      this.setState({
        mobileCheck: window.innerWidth <= 1024,
      });
    }
  }

  //checks screen width and display listViews if mobile
  mobileView() {
    if (this.state.mobileCheck) return "listWeek,listDay";
    else return "month,agendaWeek,agendaDay";
  }
  //checks screen width and display listView as default if mobile
  mobileViewDefault() {
    if (this.state.mobileCheck) return "listWeek";
    else return "month";
  }

  // Post call to the database to get the user classes (from Hannah's code)
  getCalendar = async userID => {
    const response = await fetch("/api/getCalendar", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userID: userID })
    });

    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);

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
      <div id="calendar">
        <FullCalendar
          schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
          id="your-custom-ID"
          header={{
            left: "prev,next,today",
            center: "title",
            right: this.mobileView()
          }}
          buttonText={{
            listWeek: 'week',
            listDay: 'day'
          }}
          //credits @slicedtoad and the community at stackoverflow.com for the filter portion of the code
          eventRender={function (event, element) {
            element.find('.fc-title').append("<br/>" + event.description);
            if (event.ranges) {
              return (event.ranges.filter(function (range) { // test event against all the ranges
                return (event.start.isBefore(range.end) &&
                  event.end.isAfter(range.start));
              }).length) > 0; //if it isn't in one of the ranges, don't render it (by returning false)
            }
            else return true;
          }}
          minTime={"08:00"}
          maxTime={"23:00"}
          defaultDate={Date.now()}
          navLinks={true}
          editable={false}
          eventLimit={true}
          weekends={false}
          events={this.state.events}
          defaultView={this.mobileViewDefault()}
        />
      </div>
    );
  }
}
