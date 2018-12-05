import React, { Component } from 'react';
import {
    InstantSearch,
    Hits,
    SearchBox,
    Highlight,
    RefinementList,
    Pagination,
    CurrentRefinements,
    ClearRefinements,
    Configure,
    PoweredBy
} from 'react-instantsearch-dom';
import 'instantsearch.css/themes/reset.css';
import './SearchCourse.css';
import { Button, UncontrolledCollapse } from 'reactstrap';
import { CollapsibleComponent, CollapsibleHead, CollapsibleContent } from 'react-collapsible-component'

/*
*Used to display course information (course Title, description, instructor, days, times, room)
*parts of the course will highlight when user is searching in searchbar
*/
class Course extends Component {
    constructor(props) {
        super(props);
        this.state = {
            response: ''
        };
        this.submit = this.submit.bind(this);
    }

    submit() {
        let quarter = 0, year = 2018;
        console.log(this.props.hit);
        this.submitClass({
            class: this.props.hit.courseID,
            userID: this.props.userID,
            quarter: quarter,
            year: year,
            room: this.props.hit.lecture.room,
            days: this.props.hit.lecture.days,
            times: this.props.hit.lecture.times,
            meetingDates: this.props.hit.lecture.meetingDates,
            ge: this.props.hit.meta.general_education,
            credits: this.props.hit.meta.credits,
            instructor: this.props.hit.lecture.instructor,
            courseTitle: this.props.hit.courseTitle
        }) // Send all form data to server
            .then(res => {
                this.props.onClick(this.props.hit.courseID, res._id, quarter, year, 14); // Get classLogging to update
            }).catch(err => console.log(err));
    }

    // Make post call to server to submit form data
    submitClass = async data => {
        const response = await fetch("/api/submitClass", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                class: data.class,
                userID: data.userID,
                quarter: data.quarter,
                year: data.year,
                room: data.room,
                days: data.days,
                times: data.times,
                meetingDates: data.meetingDates,
                ge: data.ge,
                credits: data.credits,
                instructor: data.instructor,
                courseTitle: data.courseTitle,
            })
        });

        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    };

    render() {
        return (
            <div style={{ padding: '10px' }}>
                <span className="hits">
                    <Button id={'id' + this.props.hit.objectID}>
                        {<Highlight attribute="courseTitle" hit={this.props.hit} tagName="mark" />}
                    </Button>
                    <Button onClick={this.submit}>Add Class</Button>  {this.state.response}
                    <UncontrolledCollapse toggler={'#id' + this.props.hit.objectID}>
                        <p><Highlight attribute="description" hit={this.props.hit} tagName="mark" /></p>
                        <p>
                            Instructor: <Highlight attribute="lecture.instructor" hit={this.props.hit} tagName="mark" />
                            <br />Days and Times: <Highlight attribute="lecture.days" hit={this.props.hit} tagName="mark" /> <Highlight attribute="lecture.times" hit={this.props.hit} tagName="mark" />
                            <br />Room: <Highlight attribute="lecture.room" hit={this.props.hit} tagName="mark" />
                            <br />Quarter: <Highlight attribute="quarter" hit={this.props.hit} tagName="mark" />
                        </p>
                    </UncontrolledCollapse>
                </span>
            </div>
        );
    }
}

/*
*Used to implement widgets
*Refinment List in collapsible menus, Current Refinements, Pagination
*Collapsile Menu: https://www.npmjs.com/package/react-collapsible-component
*/
class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <div className="container">
                <SearchBox />
                <h3>Filters</h3>
                <CollapsibleComponent>
                    <CollapsibleHead>Career</CollapsibleHead>
                    <CollapsibleContent><RefinementList attribute="meta.career" /></CollapsibleContent>

                    <CollapsibleHead>Type</CollapsibleHead>
                    <CollapsibleContent><RefinementList attribute="meta.type" /></CollapsibleContent>

                    <CollapsibleHead>Credits</CollapsibleHead>
                    <CollapsibleContent><RefinementList attribute="meta.credits" /></CollapsibleContent>

                    <CollapsibleHead>Status</CollapsibleHead>
                    <CollapsibleContent><RefinementList attribute="meta.status" /></CollapsibleContent>

                    <CollapsibleHead>General Education</CollapsibleHead>
                    <CollapsibleContent><RefinementList attribute="meta.general_education" /></CollapsibleContent>

                    <CollapsibleHead>Days</CollapsibleHead>
                    <CollapsibleContent><RefinementList attribute="lecture.days" /></CollapsibleContent>

                    <CollapsibleHead>Quarter</CollapsibleHead>
                    <CollapsibleContent><RefinementList attribute="quarter" /></CollapsibleContent>
                </CollapsibleComponent>
                <div className="Filters">
                    <CurrentRefinements />
                </div>
                <button className="clear"><ClearRefinements /></button>
                <Hits hitComponent={({ hit }) => (<Course hit={hit} onClick={this.props.onClick} userID={this.props.userID} />)} />
                <Configure hitsPerPage={10} />
                <div className="pages">
                    <Pagination showLast={true} />
                </div>
                <div className="poweredBy">
                    <PoweredBy />
                </div>
            </div>
        );
    }

}

//Used for the search
//Apparently Algolia does not like it when you try to search from a combination of two indices at the same time
//https://stackoverflow.com/questions/32615483/compare-ranking-of-algolia-query-across-multiple-indices
//https://github.com/algolia/instantsearch.js/issues/2129
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <InstantSearch
                apiKey="e0f4e3542265d408d5be8de22d00a12e"
                appId="Z4ZULV1BRS"
                indexName="combined"
            >
                <Search onClick={this.props.onClick} userID={this.props.userID} />
            </InstantSearch>
        );
    }
}

//renders the search
class SearchCourse extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <App onClick={this.props.onSubmit} userID={this.props.userID} />
        );
    }
}

export default SearchCourse