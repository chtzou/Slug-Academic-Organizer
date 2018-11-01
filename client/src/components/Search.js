import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import SearchInput, {createFilter} from 'react-search-input';
import "./Search.css";
import courses from './info'
// what to filter for
const KEYS_TO_FILTERS = ['courseID']

class Search extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchTerm: ''
    }
    this.searchUpdated = this.searchUpdated.bind(this)
  }
// key denotes the start of another class# in our data
  render () {
    const filteredCourses = courses.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS))
    return (
      <div>
	  
	  	<li><Link to='/'>Class Lookup Page</Link></li>
		<li><Link to='/signin'>Sign Up Page</Link></li>
		  
        <SearchInput className='search-input' onChange={this.searchUpdated} />
        {filteredCourses.map(data => {
          return (
            <div className='id' key={data.courseID}>
              <div className='displayId'>{data.courseID}</div>
			  
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
  
}

export default Search;

