/* eslint react/prop-types: 0 */

// Parent compoenent that wraps the profile.
// Checks if the user is looking at their own profile, or someone else's,
// and renders private or public profile accordingly.

const PublicProfile = require('./Profile/PublicProfile/PublicProfile.jsx');
const PrivateProfile = require('./Profile/Profile.jsx');
const React = require('react');
import axios from 'axios';

class ProfileChecker extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      comments: [],
      currentComment: '',
      numOfCommentsToShow: 5,
      canGetMoreComments: true
    };
    this.getComments = this.getComments.bind(this);
    this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
    this.updateComment = this.updateComment.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }
  handleScroll(e) {
    var node = document.querySelector('.comments');
    if (this.state.canGetMoreComments && node.scrollTop + node.clientHeight === node.scrollHeight) {
      console.log('Scrolled to bottom');
      this.setState({
        numOfCommentsToShow: this.state.numOfCommentsToShow + 3,
        canGetMoreComments: false
      });
      setTimeout(function() {
        this.setState({
          canGetMoreComments: true})
      }.bind(this), 500)
      this.getMoreComments();
    }
  }
  getMoreComments() {
    console.log('Getting more comments');
    const profileId = +this.props.params.match.params.id;
    axios.get(`/api/comments?id=${profileId}`)
      .then((results) => {
        this.setState({
          comments: results.data.slice(0, this.state.numOfCommentsToShow + 3)
        });
      })
  }

  getComments() {
    console.log('Getting comments');
    const profileId = +this.props.params.match.params.id;

    axios.get(`/api/comments?id=${profileId}`)
      .then((results) => {
        this.setState({ 
          comments: results.data.slice(0, this.state.numOfCommentsToShow)
        });
      })
  }
  handleCommentSubmit(e, evt, borrowerId) {
    
    console.log('submitterId is: ', this.props.id);
    console.log('borrowerId is: ', borrowerId);
    const targetId = borrowerId ? borrowerId : +this.props.params.match.params.id;
    console.log('targetId is: ', targetId);


    e.preventDefault();
    this.setState({ currentComment: '' });
    const messageData = {
      submitterId: this.props.id,
      targetId: targetId,
      message: this.state.currentComment
    };

    fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify(messageData),
    })
    .then(() => this.getComments()); 
  }
  updateComment(e) {
    console.log(`Updating comment to ${e.target.value} with props ${this.props}`);
    this.setState({ currentComment: e.target.value });
  }
  render() {
    if (this.props.id === Number(this.props.params.match.params.id)) {
      // console.log('In PrivateProfile return, this.props is: ', this.props);
      return (
        <PrivateProfile
          handleScroll={this.handleScroll}
          currentComment={this.currentComment} 
          handleCommentSubmit={this.handleCommentSubmit}
          updateComment={this.updateComment}
          getComments={this.getComments}
          comments={this.state.comments}
          id={this.props.id}
          currentUserId={this.props.id}
        />
      );
    }
    // console.log('In PublicProfile return, this.props is: ', this.props);
    return (
      <PublicProfile
        handleScroll={this.handleScroll}
        currentComment={this.currentComment} 
        handleCommentSubmit={this.handleCommentSubmit}
        updateComment={this.updateComment}
        getComments={this.getComments}
        comments={this.state.comments}
        id={this.props.params.match.params.id}
        currentUserId={this.props.id}
        self={this.props.id} 
        allProps={this.props}
      />
    );
  }
}

module.exports = ProfileChecker;
