import React from 'react';
import axios from 'axios';

class EditItemButton extends React.Component {
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

  retrieveItemInfo(item_id) {
    console.log('retrieveItemInfo fired');

    const info = {
      item_id: this.state.item_id,
    };

    fetch('/api/items', {
      method: 'GET',
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify(info)
    })
    .then
  }

  updateItemInfo() {
    console.log('updateItem fired');
  }

  editItem() {
    this.retrieveItemInfo();
    this.updateItemInfo();
  }
  
  render() {
    return (
      <div>
        <button onClick={() => this.editItem()} className="btn btn-warning btn-md">Edit Item</button>
      </div>
    );
  }
}

module.exports = EditItemButton;
