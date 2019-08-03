let speechOutput;
let reprompt;
let welcomeOutput = "Welcome to the annoying basic calculator. How can I help?";
let welcomeReprompt = " You can tell me to add, subtract, multiply or divide any two numbers.";

"use strict";

const Alexa = require('ask-sdk-v1adapter');
const APP_ID = undefined;  
speechOutput = '';

exports.handler = function(event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
    'LaunchRequest': function () {
        this.emit(':ask', welcomeOutput, welcomeReprompt);
    },
    'AMAZON.HelpIntent': function () {
        speechOutput = 'You really need help with using a calculator?';
        reprompt = '';
        this.emit(':tell',speechOutput);
    },
   'AMAZON.CancelIntent': function () {
        speechOutput = 'Request cancelled!';
        this.emit(':tell', speechOutput);
    },
   'AMAZON.StopIntent': function () {
        speechOutput = 'It was great helping you. Please use this skill again.';
        this.emit(':tell', speechOutput);
   },
   'SessionEndedRequest': function () {
        speechOutput = 'It was great helping you. Please use this skill again.';
        this.emit(':tell', speechOutput);
   },
    'AMAZON.NavigateHomeIntent': function () {
        speechOutput = '';
        this.emit(":tell", speechOutput);
    },
    'add': function () {
        let filledSlots = delegateSlotCollection.call(this);
        speechOutput = 'The answer is ';
        let firstNumSlot = parseInt(this.event.request.intent.slots.firstNum.value);  
        let secondNumSlot = parseInt(this.event.request.intent.slots.secondNum.value);
        let ans=firstNumSlot+secondNumSlot;
        this.emitWithState(':ask', speechOutput+ans, 'LaunchRequest');
    },
    'subtract': function () {
        let filledSlots = delegateSlotCollection.call(this);
        speechOutput = 'The answer is ';
        let firstNumSlot = parseInt(this.event.request.intent.slots.firstNum.value);  
        let secondNumSlot = parseInt(this.event.request.intent.slots.secondNum.value);
        let ans=firstNumSlot-secondNumSlot;
        this.emitWithState(':ask', speechOutput+ans, 'LaunchRequest');
    },
    'multiply': function () {
        let filledSlots = delegateSlotCollection.call(this);
        speechOutput = 'The answer is ';
        let firstNumSlot = parseInt(this.event.request.intent.slots.firstNum.value);  
        let secondNumSlot = parseInt(this.event.request.intent.slots.secondNum.value);
        let ans=firstNumSlot*secondNumSlot;
        this.emitWithState(':ask', speechOutput+ans, 'LaunchRequest');
    },
    'divide': function () {
        let filledSlots = delegateSlotCollection.call(this);
        speechOutput = 'The answer is ';
        let firstNumSlot = parseInt(this.event.request.intent.slots.firstNum.value);  
        let secondNumSlot = parseInt(this.event.request.intent.slots.secondNum.value);
        let ans=firstNumSlot/secondNumSlot;
        this.emitWithState(':ask', speechOutput+ans, 'LaunchRequest');
    },  
    'Unhandled': function () {
        speechOutput = "The skill didn't quite understand what you wanted.  Do you want to try something else?";
        this.emit(':ask', speechOutput, speechOutput);
    }
};

function resolveCanonical(slot){
    let canonical;
    try{
        canonical = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    }catch(err){
        console.log(err.message);
        canonical = slot.value;
    }
    return canonical;
}

function delegateSlotCollection(){
  console.log("in delegateSlotCollection");
  console.log("current dialogState: "+this.event.request.dialogState);
    if (this.event.request.dialogState === "STARTED") {
      console.log("in Beginning");
      let updatedIntent= null;
      if(this.isOverridden()) {
            return;
        }
        this.handler.response = buildSpeechletResponse({
            sessionAttributes: this.attributes,
            directives: getDialogDirectives('Dialog.Delegate', updatedIntent, null),
            shouldEndSession: false
        });
        this.emit(':responseReady', updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
      console.log("in not completed");
        if(this.isOverridden()) {
            return;
        }
        this.handler.response = buildSpeechletResponse({
            sessionAttributes: this.attributes,
            directives: getDialogDirectives('Dialog.Delegate', null, null),
            shouldEndSession: false
        });
        this.emit(':responseReady');
    } else {
      console.log("in completed");
      console.log("returning: "+ JSON.stringify(this.event.request.intent));
      return this.event.request.intent;
    }
}

function randomPhrase(array) {
    let i = 0;
    i = Math.floor(Math.random() * array.length);
    return(array[i]);
}

function isSlotValid(request, slotName){
        let slot = request.intent.slots[slotName];
        let slotValue;
        if (slot && slot.value) {
            //we have a value in the slot
            slotValue = slot.value.toLowerCase();
            return slotValue;
        } else {
            return false;
        }
}

function createSpeechObject(optionsParam) {
    if (optionsParam && optionsParam.type === 'SSML') {
        return {
            type: optionsParam.type,
            ssml: optionsParam['speech']
        };
    } else {
        return {
            type: optionsParam.type || 'PlainText',
            text: optionsParam['speech'] || optionsParam
        };
    }
}

function buildSpeechletResponse(options) {
    let alexaResponse = {
        shouldEndSession: options.shouldEndSession
    };

    if (options.output) {
        alexaResponse.outputSpeech = createSpeechObject(options.output);
    }

    if (options.reprompt) {
        alexaResponse.reprompt = {
            outputSpeech: createSpeechObject(options.reprompt)
        };
    }

    if (options.directives) {
        alexaResponse.directives = options.directives;
    }

    if (options.cardTitle && options.cardContent) {
        alexaResponse.card = {
            type: 'Simple',
            title: options.cardTitle,
            content: options.cardContent
        };

        if(options.cardImage && (options.cardImage.smallImageUrl || options.cardImage.largeImageUrl)) {
            alexaResponse.card.type = 'Standard';
            alexaResponse.card['image'] = {};

            delete alexaResponse.card.content;
            alexaResponse.card.text = options.cardContent;

            if(options.cardImage.smallImageUrl) {
                alexaResponse.card.image['smallImageUrl'] = options.cardImage.smallImageUrl;
            }

            if(options.cardImage.largeImageUrl) {
                alexaResponse.card.image['largeImageUrl'] = options.cardImage.largeImageUrl;
            }
        }
    } else if (options.cardType === 'LinkAccount') {
        alexaResponse.card = {
            type: 'LinkAccount'
        };
    } else if (options.cardType === 'AskForPermissionsConsent') {
        alexaResponse.card = {
            type: 'AskForPermissionsConsent',
            permissions: options.permissions
        };
    }

    let returnResult = {
        version: '1.0',
        response: alexaResponse
    };

    if (options.sessionAttributes) {
        returnResult.sessionAttributes = options.sessionAttributes;
    }
    return returnResult;
}

function getDialogDirectives(dialogType, updatedIntent, slotName) {
    let directive = {
        type: dialogType
    };

    if (dialogType === 'Dialog.ElicitSlot') {
        directive.slotToElicit = slotName;
    } else if (dialogType === 'Dialog.ConfirmSlot') {
        directive.slotToConfirm = slotName;
    }

    if (updatedIntent) {
        directive.updatedIntent = updatedIntent;
    }
    return [directive];
}