// Component where users can delete their items that are available for borrowing

/* eslint react/prop-types: 0 */
/*  global fetch:false  */


const React = require('react');
import axios from 'axios';

class DeleteItemButton extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      item_id: null
    }
  }

  componentDidMount() {
    this.setState({
      item_id: this.props.itemID
    })
  }

  deleteItem() {   
    // console.log('deleteItem fired');
    
    const info = {
      item_id: this.state.item_id
    };
    
    fetch('/api/items', {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify(info),
    })
     .then(() => this.props.fetchUserItems(this.props.ownerId));
  }
  
  render() {
    return (
      <div>
        <button onClick={() => this.deleteItem()} className="btn btn-warning btn-md">Delete Item</button>
      </div>
    );
  }
}

module.exports = DeleteItemButton;
