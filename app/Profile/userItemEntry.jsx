/* eslint react/prop-types: 0 */
/*  global fetch:false  */

// Private User ItemEntry Page
// Displays User Items and borrower info related to each item
// Also holds button for marking items as returned.
// As well as popup prompting the item owner to rate the item borrower when item is returned.

import { withRouter } from 'react-router';
import ReviewSplash from './reviewSplash.jsx';
import axios from 'axios';
import DeleteItemButton from './deleteItemButton.jsx';
import EditItemButton from './editItemButton.jsx'
import React from 'react';

class UserItemEntry extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = { showReviewSplash: false };
    
    this.changeRoute = () => {
      this.props.history.push(`/profile/${this.props.borrowerId}/`);
      this.props.populateProfile(this.props.borrowerId);
      this.props.fetchUserItems();
      this.props.fetchBorrowedItems();
    };
    
    this.returnItem = this.returnItem.bind(this);
    this.toggleReviewSplash = this.toggleReviewSplash.bind(this);
    this.handleRatingClick = this.handleRatingClick.bind(this);
  }
  returnItem() {
    // fetch(`/api/items/${this.props.itemId}`, {
    //   credentials: 'same-origin',
    //   method: 'PUT',
    // })
    //   .then(() => this.props.fetchUserItems(this.props.ownerId))
    //   .catch(() => alert('Sorry, there was a problem fulfilling your request. Please try again'));

    axios.put(`/api/items/${this.props.itemId}`)
      .then(() => this.props.fetchUserItems(this.props.ownerId))
      .catch(() => alert('Sorry, there was a problem fulfilling your request. Please try again'));
  }
  toggleReviewSplash() {
    const { showReviewSplash } = this.state;
    this.setState({ showReviewSplash: !showReviewSplash });
  }

  handleRatingClick(rating) {
    this.toggleReviewSplash();
    const data = { id: this.props.borrowerId, rating };
    // fetch('/api/ratings/', {
    //   method: 'PUT',
    //   headers: {
    //     'Content-type': 'application/json',
    //   },
    //   credentials: 'same-origin',
    //   body: JSON.stringify(data),
    // })
    //   . then(() => this.returnItem())
    //   .catch(err => console.log('error updating rating', err));
    axios.put('/api/ratings/', {
      id: this.props.borrowerId, rating
    })
      .then(() => this.returnItem())
      .catch(err => console.log('Error updating rating', err));
  }
  render() {
    const { showReviewSplash } = this.state;
    return (
      <div className="row">
        <ReviewSplash
          borrowerId={this.props.borrowerId}
          currentComment={this.props.currentComment} 
          handleCommentSubmit={this.props.handleCommentSubmit}
          updateComment={this.props.updateComment}
          showReviewSplash={showReviewSplash}
          handleRatingClick={this.handleRatingClick}
        />
        <a className="pull-left col-md-2">
          <img
            src={this.props.image}
            alt={this.props.title}
            className="media-photo img-responsive"
          />
        </a>
        <DeleteItemButton 
          itemID={this.props.itemId}
          fetchUserItems={this.props.fetchUserItems}
          ownerId={this.props.ownerId}
        />
        
        
        <EditItemButton
          itemID={this.props.itemId}
        />


        <div className="col-md-6">
          <h4 className="title">{this.props.title}</h4>
          <p className="summary">{this.props.description}</p>
        </div>
        <div className="col-md-4">
          { this.props.borrower &&
            <div>
              <p>Borrower: </p>
              <button onClick={this.changeRoute} className="btn-link">
                {this.props.borrower}
              </button>
              <button className="btn btn-primary returnItemButton" onClick={this.toggleReviewSplash}>
                Item Returned?
              </button> 
            </div>
          }
        </div>
      </div>
    )
  }
}
const UserItemEntryWithRouter = withRouter(UserItemEntry);

module.exports = UserItemEntryWithRouter;
