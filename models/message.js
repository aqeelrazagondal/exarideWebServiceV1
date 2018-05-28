const mongoose = require('mongoose');
const { User } = require('./user');
const { Admin } = require('./admin');

// Define our schema
const MessagesSchema   = new mongoose.Schema({
    messageType: String,
    messageText: String,
    messageData:Object,
    _messageToUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' ,default:null },
    _messageFromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin'},
    // _messageFromMobile: String,
    // _messageToMobile: {type : String, default :null },
    //  createdOnUTC: { type: Date, default: Date.now },
    // updatedOnUTC: { type: Date, default: Date.now },
    // userMessageFromDeliverStatus: { type: Boolean, default: false },
    // deletedByUserMobile: String,
}, {timestamps: true});

// MessagesSchema.index({_conversationId:1, _messageFromMobile: 1,_messageToMobile: 1,createdOnUTC:1})
// Export the Mongoose model
module.exports = mongoose.model('ConversationMessages', MessagesSchema);