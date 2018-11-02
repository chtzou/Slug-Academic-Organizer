import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import SearchInput, {createFilter} from 'react-search-input';
import "./Search.css";
import { Fade, ListGroup, ListGroupItem } from 'reactstrap';

//import courses from './info'
// what to filter for
const KEYS_TO_FILTERS = ['courseID']

class Search extends Component {
  constructor (props) {
    super(props)
    this.state = {
	  courses: [],
      searchTerm: '',
	  fadeIn: true,
    }
	this.searchUpdated = this.searchUpdated.bind(this);
	this.toggle = this.toggle.bind(this);
  }
  
    // request server data
      componentDidMount() {
        this.callApi()
          .then(res => this.setState({ courses: res}))
          .catch(err => console.log(err));
      }
    
      callApi = async () => {
        const response = await fetch("/api/GetCourses");
        const body = await response.json();
    
        if (response.status !== 200) throw Error(body.message);
        console.log(body);
        return body;
      };

//display our filtered results	  
  render () {
    const filteredCourses = this.state.courses.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS))
    return (
      <div>  
	  	<li><Link to='/'>Class Lookup Page</Link></li>
		<li><Link to='/signin'>Sign Up Page</Link></li>	  
        <SearchInput className='search-input' onChange={this.searchUpdated} />
        {filteredCourses.map(data => {
          return (
		  <div>
			<ListGroup>
				<ListGroupItem>{data.courseID}</ListGroupItem>
				<Fade in={this.state.fadeIn} tag="h5" className="mt-3">
					{data.courseTitle}
					{data.description}
					{data.credits}
				</Fade>
			</ListGroup>
		  </div>
          )
        })}
      </div>
    )
  }
//updates whenever a character changes
  searchUpdated (term) {
    this.setState({searchTerm: term})
  }
  
//fade toggle
  toggle() {
        this.setState({
            fadeIn: !this.state.fadeIn
        });
    }
}
export default Search;

