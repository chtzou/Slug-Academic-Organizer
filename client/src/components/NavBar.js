import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink
} from "reactstrap";
import "../styles/NavBar.css";

export default class NavBar extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: true
    };
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    return (
      <div>
        <Navbar color="faded" dark expand="md" role="navigation">
          <img className="logo" src={require("../images/slug.svg")} alt="logo" />
          <div className="home-link">
            <NavbarBrand tag={Link} to="/" className="mr-auto">
              Slug Organizer
            </NavbarBrand>
          </div>
          <NavbarToggler onClick={this.toggle} className="mr-2" />
          <Collapse isOpen={!this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem className="link-1">
                <NavLink tag={Link} to="/">
                  Account
                </NavLink>
              </NavItem>
              <NavItem className="link-2">
                <NavLink tag={Link} to="/logging">
                  Class Logging
                </NavLink>
              </NavItem>
              <NavItem className="link-4">
                <NavLink tag={Link} to="/grades">
                  Grades
                </NavLink>
              </NavItem>
              <NavItem className="link-5">
                <NavLink tag={Link} to="/major">
                  Major Requirements
                </NavLink>
              </NavItem>
              <NavItem className="link-6">
                <NavLink tag={Link} to="/ge">
                  GE Requirements
                </NavLink>
              </NavItem>
              <NavItem className="link-7">
                <NavLink tag={Link} to="/calendar">
                  Calendar
                </NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}
