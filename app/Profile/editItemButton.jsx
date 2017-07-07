import React from 'react';
import axios from 'axios';

class EditItemButton extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      item_id: null,
      isEditing: false

    }
  }

  componentDidMount() {
    this.setState({
      item_id: this.props.itemID
    })
  }

  editItem() {   
    console.log('editItem fired');
    console.log('editItem this.state.item_id:', this.state.item_id);

    const info = {
      item_id: this.state.item_id,  
    };
    

    fetch('/api/items', {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify(info),
    })
    //  .then(() => this.props.fetchUserItems(this.props.ownerId));
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
