/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"] */

'use strict'

const Alexa = require('alexa-sdk')
const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()

const APP_ID = 'amzn1.ask.skill.d13830e8-e555-4b45-adb1-665d0a302d00'
const HDB_TABLE = 'HedgehogStates'

// const languageStrings = {
//   'en': {
//     translation: {
//       SKILL_NAME: 'Space Facts',
//     }
//   }
// }

const states = {
  UNCONNECTED: '',
  CONNECTED: '_AC'
}

const newSessionHandlers = {
//   'NewSession': function () {
//     console.log('NEWSESSION h', this.attributes.id)

//     if (!this.attributes.id) {
//       this.handler.state = states.UNCONNECTED
//     } else if (this.attributes.id === 9000) {
//       this.handler.state = states.CONNECTED
//     } else {
//       docClient.get({
//         TableName: HDB_TABLE,
//         Key: { 'id': { 'S': 'h' + this.attributes.id } },
//         ProjectionExpression: 'id',
//         ReturnConsumedCapacity: 'NONE'
//       }, function (err) {
//         if (err) this.handler.state = states.UNCONNECTED
//         else this.handler.state = states.CONNECTED
//       })
//     }

//     console.log('NEWSESSION ', this.handler.state)
//     if (this.handler.state === states.CONNECTED) {
//       this.emit(':tell', "Hi, I'm hedgehog bot " + this.attributes.id + '. ' +
//         'If you didn\'t expect me, say <break strength="medium"/> "Alexa, ' +
//         'tell hedgehog bot to disconnect."')
//     } else {
//       this.emit(':tell', "Before you can control your hedgehog bot, you'll " +
//         'need to connect to it, by saying <break strength="medium"/> "Alexa, ' +
//         'tell hedgehog bot to connect to my bot."')
//     }
//   }
// }

// const unconnectedHandlers = Alexa.CreateStateHandler(states.UNCONNECTED, {
  'ConnectIntent': function () {
    let id = this.event.request.intent.slots.hedgehogPin.value
    console.log('UC CONNECT h', id)

    if (this.event.request.intent.dialogState !== 'COMPLETED') {
      this.emit(':delegate')
    } else if (id !== '9000') {
      let self = this
      docClient.get({
        TableName: HDB_TABLE,
        Key: { 'id': { 'S': 'h' + id } },
        ProjectionExpression: 'id',
        ReturnConsumedCapacity: 'NONE'
      }, function (err) {
        if (err) {
          console.log('UC CONNECT FAIL')
          self.emit(':tell', "I couldn't find your hedgehog bot. Check " +
            "the PIN on your bot's display.")
        } else {
          console.log('UC CONNECT OKAY')
          self.handler.state = states.CONNECTED
          self.attributes.id = id
          self.emit(':tell', "Hi, I'm hedgehog bot " + id + '. Try and make ' +
            'me wink by saying <break strength="medium"/> "Alexa, tell ' +
            'hedgehog bot to make a winky face."')
        }
      })
    } else {
      console.log('UC CONNECT TEST')
      this.handler.state = states.CONNECTED
      this.attributes.id = id
      this.emit(':tell', 'Hi, I\'m test bot.')
    }
  },
  'DisconnectIntent': function () {
    console.log('UC DISCONNECT')
    this.emit(':tell', "I'm not connected to your hedgehog bot.")
  },
  'AMAZON.HelpIntent': function () {
    console.log('UC HELP')
    this.emit(':tell', 'To connect to your hedgehog bot, connect to it by ' +
      'saying <break strength="medium"/> "Alexa, tell hedgehog bot to ' +
      'connect to my bot."')
  },
  'Unhandled': function () {
    console.log('UC UNHANDLED')
    this.emit(':tell', "Before you can control your hedgehog bot, you'll " +
      'need to connect to it, by saying <break strength="medium"/> "Alexa, ' +
      'tell hedgehog bot to connect to my bot."')
  }
}// )

const connectedHandlers = Alexa.CreateStateHandler(states.CONNECTED, {
  'ConnectIntent': function () {
    let id = this.event.request.intent.slots.hedgehogPin.value
    console.log('AC CONNECT h', this.attributes.id, ' -> h', id)

    if (this.event.request.intent.confirmationStatus !== 'CONFIRMED') {
      if (this.event.request.intent.confirmationStatus !== 'DENIED') {
        if (id !== '9000') {
          let self = this
          docClient.get({
            TableName: HDB_TABLE,
            Key: { 'id': { 'S': 'h' + id } },
            ProjectionExpression: 'id',
            ReturnConsumedCapacity: 'NONE'
          }, function (err) {
            if (err) {
              console.log('AC CONNECT FAIL')
              self.emit(':tell', "I couldn't find your hedgehog bot. Check " +
                "the PIN on your bot's display.")
            } else {
              console.log('AC CONNECT CONFIRM')
              self.emit(':confirmIntent', "You're already connected to " +
                'hedgehog bot ' + self.attributes.id + ". Are you sure you'd " +
                'like to disconnect, and connect to bot ' + id + '?', 'Are ' +
                "you sure you'd like to connect to bot " + id + '?')
            }
          })
        } else {
          console.log('AC CONNECT CONFIRM_TEST')
          this.emit(':confirmIntent', "You're already connected to " +
            'hedgehog bot ' + this.attributes.id + ". Are you sure you'd " +
            'like to disconnect, and connect to the test service?', 'Are ' +
            "you sure you'd like to connect to the test service?")
        }
      } else {
        console.log('AC CONNECT CANCEL')
        this.emit(':tell', '<say-as interpret-as="interjection">Phew</say-as>.' +
          "You're still connected to hedgehog bot " + this.attributes.id)
      }
    } else {
      this.attributes.id = id
      if (id !== '9000') {
        console.log('AC CONNECT OKAY')
        this.emit(':tell', '<say-as interpret-as="interjection">As you ' +
          ' wish</say-as>. <break strength="x-strong"/> "Hi, I\'m hedgehog ' +
          'bot ' + id + '. Try and make me wink by saying ' +
          '<break strength="medium"/> "Alexa, tell hedgehog bot to make a ' +
          'winky face."')
      } else {
        console.log('AC CONNECT TEST')
        this.emit(':tell', '<say-as interpret-as="interjection">As you ' +
          ' wish</say-as>. <break strength="x-strong"/> Hi, I\'m test bot.')
      }
    }
  },
  'DisconnectIntent': function () {
    console.log('AC DISCONNECT')
    this.attributes.id = ''
    this.handler.state = states.UNCONNECTED
    this.emit(':tell', '<say-as interpret-as="interjection">Au revoir</say-as>.')
  },
  'DrawIntent': function () {
    let drawSlot = this.event.request.intent.slots.draw
    let draw = drawSlot.resolutions.resolutionsPerAuthority[0].values[0].value
    console.log('AC DRAW h', this.attributes.id, '::', draw)

    if (this.attributes.id === '9000') {
      this.emit(':tell', "I'm " + draw.name)
    } else {
      // TODO: Integrate AWS IoT
      this.emit(':tell', "I'm " + draw.name)
    }
  },
  'MotorIntent': function () {
    let dirSlot = this.event.request.intent.slots.draw
    let dir = dirSlot.resolutions.resolutionsPerAuthority[0].values[0].value
    console.log('AC MOVE h', this.attributes.id, '::', dir)

    if (this.attributes.id === '9000') {
      this.emit(':tell', "I'm going " + dir.name)
    } else {
      // TODO: Integrate AWS IoT
      this.emit(':tell', "I'm going " + dir.name)
    }
  },
  'AMAZON.StopIntent': function () {
    console.log('AC STOP')
    this.emit(':tell', "I'm stopping")
  },
  'AMAZON.HelpIntent': function () {
    console.log('AC HELP')
    this.emit(':tell', 'You can move me by saying <break strength="medium"/> ' +
      '"Alexa, tell hedgehog bot to go forwards", or make my expression ' +
      'change by saying <break strength="medium"/> "Alexa, tell hedgehog bot ' +
      'to make a frowny face".')
  },
  'Unhandled': function () {
    console.log('AC UNHANDLED')
    this.emit(':tell', "I didn't catch that. You can move me by saying " +
      '<break strength="medium"/> "Alexa, tell hedgehog bot to go forwards", ' +
      'or make my expression change by saying <break strength="medium"/> ' +
      '"Alexa, tell hedgehog bot to make a frowny face".')
  }
})

exports.handler = function (event, context) {
  const alexa = Alexa.handler(event, context)
  alexa.appId = APP_ID
  // alexa.dynamoDBTableName = 'hedgehogUsers'
  // To enable string internationalization (i18n) features, set a resources object.
  // alexa.resources = languageStrings
  alexa.registerHandlers(newSessionHandlers, /* unconnectedHandlers, */connectedHandlers)
  alexa.execute()
}
