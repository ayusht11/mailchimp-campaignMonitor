import _ from 'lodash';
import validator from 'validator';
import RequestHandler from './../../lib/requestHandler';
import subscriberValidator from './../../lib/subscriberValidator';

export default class MailchimpHandler {

  constructor (baseUrl, req, res) {
    this.userInfo = {
      baseUrl : baseUrl,
      username : req.header('username'),
      password : req.header('password')
    }
  }

  getSubscribers (req, res) {
    const path = `lists/${req.params.listId}/members`;
    const page = _.parseInt(req.query.page);
    const page_size = _.parseInt(req.query.page_size);
    const skip = (page-1) * page_size; 
    const query = { 
      fields: 'members.id,members.email_address,members.merge_fields,members.timestamp_signup,total_items',
      offset: skip,
      count: page_size
    }

    RequestHandler.get(this.userInfo, path, query)
     .then((data) => {
        let jsonData = JSON.parse(data);
        let responseBody = {
          total_items : jsonData.total_items,
          subscribers : []
        };

        _.forEach(jsonData.members, function(member) {
          let subscriber = {
            subscriber_id : member.id,
            email : member.email_address,
            first_name : member.merge_fields.FNAME,
            last_name : member.merge_fields.LNAME
          };
          if(member.timestamp_signup === "") {
            subscriber.confirmed_time = null;  
          }
          else {
            subscriber.confirmed_time = new Date(member.timestamp_signup);
          }
          responseBody.subscribers.push(subscriber);
        });
        
        res.status(200).json(responseBody);
      })
     .catch((err) => {
        res.status(400).send({url: `${req.originalUrl} bad request`, error: err});
      });
  } 
  
  addSubscriber (req, res) {
    let subscriberCheck = subscriberValidator(req, res);
    if(!subscriberCheck.validated) {
      return res.status(400).send(subscriberCheck);
    }

    let {first_name, last_name} = req.body;
    let subscriber = {
      status : 'subscribed',
      email_type : 'html',
      email_address : req.body.email,
      merge_fields : {
        FNAME : first_name,
        LNAME : last_name
      },
      interests : {}
    };

    _.forEach(req.body.custom_fields.interests, function(value) {
      if(validator.isHexadecimal(value)) {
        subscriber.interests[value] = true;
      }
      else res.status(400).send({err: `${value} is not a valid hexadecimal ID`});
    });

    const path = `lists/${req.params.listId}/members`;    
    const query = {
      fields: 'id,email_address,email_type,merge_fields,interests'
    };

    RequestHandler.post(subscriber, this.userInfo, path, query)
     .then((data) => {
        if(data.status === 400) { 
          return res.status(400).send(data); 
        }
        
        let responseBody = {
          subscriber_id : data.id,
          email : data.email_address,
          email_type : data.email_type,
          first_name : data.merge_fields.FNAME,
          last_name : data.merge_fields.LNAME,
          custom_fields: {
            interests : data.interests,
            merge_fields : data.merge_fields
          }
        }

        res.status(201).json(responseBody);
      })
     .catch((err) => {
        res.status(400).send({url: `${req.originalUrl} bad request`, error: err});
      });
  } 
}
