/*  global fetch:false  */
/* eslint react/prop-types: 0 */
// User Profile Page

const React = require('react');
const PublicProfileBio = require('./publicProfileBio.jsx');
const PublicProfileItemList = require('./publicProfileItemList.jsx');
import CommentForm from './publicCommentForm.jsx';
import Comments from './publicComments.jsx';


class PublicProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      fbId: null,
      fbToken: null,
      image: null,
      name: null,
      email: null,
      password: null,
      street: null,
      city: null,
      state: null,
      zip: null,
      bio: null,
      rating: null,
      ratingCount: null,
      createdAt: null,
      updatedAt: null,
      comments: [],
      currentComment: '' // added empty comments array
    };
    this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
    this.updateComment = this.updateComment.bind(this);
  }
  componentWillMount() {
    this.populateProfile(this.props.id);
  }
  // Populate profile populates the profile page by querying the User table by Id.
  // It is passed down to both borrowedItemEntry and UserItemEntry as a click handler.
  populateProfile(profileRoute) {
    fetch(`/api/profile/${profileRoute}`, { credentials: 'same-origin' })
      .then(profile => profile.json())
      .then(json => this.setState(json));
  }
  handleCommentSubmit(message) {
    const messageData = {
      submitterId: this.props.currentUserId,
      targetId: this.state.id,
      message
    };

    fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify(messageData),
    });
    
  }
  updateComment(e) {
    this.setState({ currentComment: e.target.value });
  }

  render() {
    return (
      <div className="container">
        <div className="col-lg-5 sub-component">
          <img
            className="img-responsive"
            src={this.state.image}
            alt=""
          />
          <section className="spacer" />
          <PublicProfileBio
            fullName={this.state.fullName}
            email={this.state.email}
            bio={this.state.bio}
            rating={this.state.rating}
            city={this.state.city}
            state={this.state.state}
            zip={this.state.zip}
          />
        </div>
        <div className="col-lg-7">
          {this.state.id &&
            <PublicProfileItemList
              populateProfile={this.populateProfile.bind(this)}
              userId={this.state.id}
            />
          }
        </div>
        <div>
          <div>
            <Comments comments={this.state.comments}/>
          </div>
          <div>
            <CommentForm 
              handleCommentSubmit={this.handleCommentSubmit}
              updateComment={this.updateComment}
            />
          </div>
        </div>
      </div>

    );
  }
}

module.exports = PublicProfile;
