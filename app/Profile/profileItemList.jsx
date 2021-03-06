// Profile Item List Page
// Has Tabs for UserItemEntry(s).jsx and BorrowedItemEntry(s).jsx.
// Before it mounts it fetches Items table and adds user and
// borrowed items to state.


/*  global fetch:false  */
/* eslint react/prop-types: 0 */

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

const React = require('react');
const UserItemEntry = require('./userItemEntry.jsx');
const BorrowedItemEntry = require('./borrowedItemEntry.jsx');

class ProfileItemList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userItems: null,
      borrowedItems: null,
    };
    this.fetchUserItems = this.fetchUserItems.bind(this);
  }

  componentWillMount() {
    this.fetchUserItems(this.props.userId);
    this.fetchBorrowedItems(this.props.userId);
  }

  // Component should update if userId changes clicking on other user's profile
  // or if you add an item (changes flag on state in profile)
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.userId !== nextProps.userId || (this.props.flag !== nextProps.flag)) {
      this.fetchUserItems(nextProps.userId);
      this.fetchBorrowedItems(nextProps.userId);
    }
    return true;
  }
  fetchUserItems(route) {
    fetch(`/api/userItems/${route}`, { credentials: 'same-origin' })
      .then(items => items.json())
      .then(json => this.setState({
        userItems: json,
      }));
  }
  fetchBorrowedItems(route) {
    fetch(`/api/borrowedItems/${route}`, { credentials: 'same-origin' })
      .then(items => items.json())
      .then(json => this.setState({
        borrowedItems: json,
      }));
  }
  render() {
    return (
      <Tabs className="sub-component">
        <TabList>
          <Tab>My Stuff</Tab>
          <Tab>Borrowed</Tab>
        </TabList>
        <TabPanel>
          {this.state.userItems && this.state.userItems.map(item =>
            (<UserItemEntry
              image={item.image}
              ownerId={item.owner_id}
              itemId={item.id}
              title={item.title}
              description={item.itemDescription}
              borrower={item.borrower ? item.borrower.fullName : null}
              borrowerId={item.borrower_id ? item.borrower_id : null}
              populateProfile={this.props.populateProfile}
              fetchUserItems={this.fetchUserItems}
              fetchBorrowedItems={this.fetchBorrowedItems.bind(this)}
            />),
          )}
        </TabPanel>
        <TabPanel>
          {this.state.borrowedItems && this.state.borrowedItems.map(item =>
            (<BorrowedItemEntry
              image={item.image}
              title={item.title}
              description={item.itemDescription}
              owner={item.owner.fullName}
              ownerId={item.owner_id}
              populateProfile={this.props.populateProfile}
            />),
          )}
        </TabPanel>
      </Tabs>
    );
  }
}

module.exports = ProfileItemList;
