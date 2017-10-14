// put 2 and 2 together
const Item = require('../db/models/items.js');
const User = require('../db/models/users.js');
const Comment = require('../db/models/comments.js');
const Session = require('../db/models/session.js');
const Room = require('../db/models/room.js');
const Message = require('../db/models/messages.js');

const passport = require('passport');
const request = require('request');
const { googleMapsPromise, addDistance } = require('./geoUtilities.js');
const secret = require('../private/apiKeys.js'); // create file matching this route to hold relevant api keys

const sid = process.env.sid || secret.sid;
const authorizationCode = process.env.authorizationCode || secret.authorizationCode;
const twilioNumber = process.env.twilioNumber || secret.twilioNumber;
const myNumber = process.env.myNumber || secret.myNumber;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || secret.GOOGLE_API_KEY;

exports.publicRoutes = [
  '/',
  '/profile/',
  '/profile/:id',
  '/login',
  '/signup',
];

exports.updateComment = (req, res) => {
  console.log('Entering updateComment where req.body is: ', req.body);
  Comment.update({message: req.body.message}, { where: { id: req.body.commentId }})
    .then((result) => {
      console.log('Done updating. Result: ', result);
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log('Error updating comment: ', err);
      res.sendStatus(500);
    });
}
exports.deleteComment = (req, res) => {
  console.log('Entering deleteComment where req.body is: ', req.body);
  Comment.destroy({where: {id: req.body.commentId}})
    .then((result) => {
      console.log('Done deleting. Result: ', result);
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log('Error deleting comment: ', err);
      res.sendStatus(500);
    });
}
exports.comment = (req, res) => {
  console.log('Adding comment where req.body is: ', req.body);
  Comment.create({
    message: req.body.message,
    target: req.body.targetId,
    submitter: req.body.submitterId,
    sender_id: req.body.submitterId,
    receiver_id: req.body.targetId
  })
    .then(() => res.sendStatus(200))
    .catch((err) => {
      res.status(500).send('Error adding comment: ', err);
    });
}
exports.getComments = (req, res) => {
  console.log('Entering getComments where query is: ', req.query);
  Comment.findAll({
    where: {
      target: req.query.id
    },
    include: [
      {model: User, as: 'receiver', attributes: ['fullName']}, 
      {model: User, as: 'sender', attributes: ['fullName']}
    ],
    order: [
      ['createdAt', 'DESC']
    ]
  })
    .then((comments) => {
      // res.sendStatus(200);
      // console.log('Found comments: ', comments);
      res.send(comments)
    })
    .catch(err => res.status(500).send('Error finding comments: ', err));
}
exports.checkSession = (req, res, next) => {
  console.log(req.sessionID);
  if (req.sessionID) {
    Session.findOne({
      where: { sid: req.sessionID },
      include: [{ model: User, as: 'User' }],
    })
    .then((sessionSave) => {
      if (sessionSave) {
        if (sessionSave.userId) {
          return res.send({ success: true, message: 'authentication succeeded', profile: sessionSave.User });
        }
        return res.send({ success: false, message: 'session exists but userId is not assigned', profile: null });
      }
      return res.send({ success: false, message: 'no session found', profile: null });
    });
  } else {
    next();
  }
};

const sendMessage = (item) => {
  const itemName = item.title;
  const userID = item.borrower.fullName;
  const userNumber = item.borrower.phone;
  const header = {
    Authorization: authorizationCode,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  const options = {
    url: `https://www.@api.twilio.com/2010-04-01/Accounts/${sid}/Messages`,
    method: 'POST',
    headers: header,
    form: { To: myNumber, From: twilioNumber, Body: `${userID} would like to borrow your ${itemName}. You can contact them at ${userNumber}.` },
  };
  request(options, (error) => {
    if (error) {
      throw error;
    }
  });
};

exports.getProfile = (req, res) => {
  User.findById(req.params.id)
    .then((profile) => {
      if (!profile) {
        res.status(400).send('Could not find user profile');
      } else {
        res.status(200).send(profile);
      }
      return 'getProfile promise resolved';
    });
};
exports.getUserItems = (req, res) => {
  Item.findAll({
    where: {
      owner_id: req.params.userId,
    },
    include: [{model: User, as: 'borrower', attributes: ['fullName']}],
  })
    .then((items) => {
      if (!items) {
        res.status(400).send('Could not find User Items');
      } else {
        res.status(200).send(items);
      }
      return 'getUserItems promise resolved';
    });
};

exports.returnItem = (req, res) => {
  const itemId = req.params.id;
  Item.findById(itemId)
    .then(item =>  {
      if (item.borrower_id) {
        item.update({borrower_id:null});
      } else {
        throw new Error('Not currently borrowed');
      }
    })
    .then(() => res.status(202).send())
    .catch(() => res.status(304).send('error'));
};

exports.getBorrowedItems = (req, res) => {
  Item.findAll({
    where: {
      borrower_id: req.params.userId,
    },
    include: [{ model: User, as: 'owner', attributes: ['fullName'] }],
  })
    .then((items) => {
      if (!items) {
        res.status(400).send('Could not find Borrowed Items');
      } else {
        res.status(200).send(items);
      }
      return 'getBorrowedItems promise resolved';
    });
};

exports.addItems = (req, res) => {
  Item.create({
    title: req.body.title,
    image: req.body.image,
    itemDescription: req.body.description,
    owner_id: req.body.user_id,
  })
    .then(() => res.status(200).send())
    .catch((err) => {
      res.status(500).send('error adding new item')
    });
};


//-----
// EDIT ITEM BUTTON
//-----
exports.getItemInfo = (req, res) => {
  let itemID = req.params.id;
  console.log('getItemInfo controller where query is: ', itemID);

  Item.findById(itemId)
    .then((itemInfo) => {
      console.log('successfully got item info', result);
      res.send(itemInfo);
    })
    .catch((err) => {
      res.status(500).send('Error getting item info', err);
    });
};

exports.updateItemInfo = (req, res) => {
  var itemID = req.body.item_id;

  Item.update({message: req.body.message}, { where: { id: req.body.commentId }})
    .then((result) => {
      console.log('Done updating. Result: ', result);
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log('Error updating comment: ', err);
      res.sendStatus(500);
    });
};

exports.deleteItems = (req, res) => {
  var itemID = req.body.item_id;
  console.log('deleteItems controller req.body.item_id:', itemID);
  
  Item.destroy({
    where: {
      id: itemID
    }
  })
  .then((result) => {
    console.log('successful deleting item', result);
    res.sendStatus(200);
  })
  .catch((err) => {
    console.log('error deleting item', err);
    res.sendStatus(500);
  });
};

exports.borrow = (req, res) => {
  Item.update({
    borrower_id: req.body.userID,
  }, {
    where: {
      id: req.body.id,
      borrower_id: null,
    },
  })
    .then((data) => {
      if (data[0] === 0) {
        throw new Error('already borrowed');
      } else {
        return Item.find({
          where: {
            id: req.body.id,
          },
          include: [{ model: User, as: 'borrower', attributes: ['fullName', 'phone'] }, { model: User, as: 'owner', attributes: ['phone'] }],
        });
      }
    })
    .then((item) => { sendMessage(item); })
    .then(() => res.status(201).send())
    .catch(() => res.status(500).send('error borrowing item'));
};

exports.search = (req, res) => {
  const promiseQueue = [];
  const query = req.query.item;
  const itemSearchPromise = Item.findAll({ where: { title: { $iLike: `%${query}%` } },
    include: [{ model: User, as: 'owner', attributes: ['firstName', 'rating', 'location'] }] });
  promiseQueue.push(itemSearchPromise);
  const zip = req.query.zip;
  if (zip && zip.length === 5) {
    promiseQueue.push(googleMapsPromise (zip));
  }
  Promise.all(promiseQueue)
    .then(([ itemList, coords ]) => {
      if (coords) {
        itemList = itemList.map(item => addDistance(item, coords));
      }  
      const itemPayload = { items:itemList, location: (coords || null) };
      res.json(itemPayload)
    })
    .catch(err => {
      res.status(500).send();
    });
};

exports.handleLogin = (req, res, next) => {
  passport.authenticate('local-login', (err, user) => {
    if (err) {
      return next(err); // will generate a 500 error
    }
    // Generate a JSON response reflecting authentication status
    if (!user) {
      return res.status(400).send({ success: false, message: 'authentication failed' });
    }
    return req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      req.session.userId = user.id;
      return res.send({ success: true, message: 'authentication succeeded', profile: user });
    });
  })(req, res, next);
};
exports.handleSignup = (req, res, next) => {
  console.log('Entering handlesignup');
  passport.authenticate('local-signup', (err, user) => {
    if (err) {
      return next(err); // will generate a 500 error
    }
    // Generate a JSON response reflecting authentication status
    if (!user) {
      return res.send({ success: false, message: 'authentication failed' });
    }
    return req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      req.session.userId = user.id;
      return res.send({
        success: true,
        message: 'authentication succeeded',
        profile: user
      });
    });
  })(req, res, next);
};

exports.handleLogout = (req, res) => {
  Session.destroy({ where: { sid: req.sessionID } });
  res.redirect('/');
};

exports.checkAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    console.log('Authenticated OK')
    next();
  } else {
    console.log('Authentication failed');
    res.redirect('/');
  }
};

exports.updateUser = (req, res) => {
  User.update({
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    fullName: `${req.body.firstName} ${req.body.lastName}`,
    email: req.body.email,
    bio: req.body.bio,
  }, {where : {id: req.body.user_id} })
  .then((User) => res.send(User))
};

exports.updateRating = (req, res) => {
  const {id, rating } = (req.body);
  User.findById(id)
    .then((user) => {
      user.ratingCount += 1;
      user.rating = (user.rating * (user.ratingCount -1 ) + rating) / user.ratingCount;
      return user.save();
    })
    .then(() => res.status(201).send())
    .catch(() => res.status(500).send());
}

exports.findRoom = (data) => {
  console.log('+++findRoom executed!!!', data)
  return Room.findOrCreate({
      where: {
        $or: [
          {
            self_id: data.self,
            friend_id: data.friend
          },
          {
            self_id: data.friend,
            friend_id: data.self
          }
        ]
      },
      defaults: {
        roomId: data.self + '-' + data.friend,
        self_id: data.self,
        friend_id: data.friend  
      } 
    }).then((room) => room[0].get({ plain:true }))
    .then(roomObject => {
      console.log('+++roomObject: ', roomObject)
      return roomObject
    })
}

exports.getMessages = (roomObject) => {
  return Message.findAll({
    where: {room_id: roomObject.id}
  })
  .then((messageArray) => {
    return messageArray
  }).then((messages) => {
    console.log('+++getMessages #3: ', messages)
    return messages
  })
}

exports.saveMessages = (message) => {
  Message.create(message)
    .then(console.log('+++saveMessages, message: ', message))
}