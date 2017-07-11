import _ from 'lodash';
import validator from 'validator';
import RequestHandler from './../../lib/requestController';
import subscriberValidator from './../../lib/subscriberValidator';

export default class CampaignMonitorHandler {

  constructor (baseUrl, req, res) {
    this.userInfo = {
      baseUrl : baseUrl,
      username : req.header('username'),
      password : req.header('password')
    }
  }

  getSubscribers (req, res) {
    const path = 'lists/4f71828e4330aee39d9df681ce1aea4b/active.json';
    const page = _.parseInt(req.query.page);
    const page_size = _.parseInt(req.query.page_size); 
    const paginationQuery = {
      page: page,
      pagesize: page_size,
      orderfield: 'email',
      orderdirection: 'asc'
    }
    
    RequestHandler.get(this.userInfo, path, paginationQuery)
     .then((data) => {
        let jsonData = JSON.parse(data);
        let responseBody = {
          total_items : jsonData.TotalNumberOfRecords,
          subscribers : []
        };

        _.forEach(jsonData.Results, function(member) {
          let name = _.split(member.Name, ' ', 2);
          let subscriber = {
            subscriber_id : new Buffer(member.EmailAddress).toString('base64'),
            email : member.EmailAddress,
            first_name : name[0],
            last_name : name[1],
            confirmed_time : member.Date
          };

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

    let subscriber = {
      EmailAddress : req.body.email,
      Name : req.body.first_name + req.body.last_name,
      CustomFields : [],
      Resubscribe : true,
      RestartSubscriptionBasedAutoresponders : true
    };
    const path = 'subscribers/4f71828e4330aee39d9df681ce1aea4b.json';

    RequestHandler.post(subscriber, this.userInfo, path)
     .then((data) => {
        if(data.Code) return res.status(400).send({ err: data.Message });
        
        let {first_name, last_name} = req.body;        
        let responseBody = {
          subscriber_id : new Buffer(data).toString('base64'),
          email : data,
          email_type : null,
          custom_fields : {
            interests : null,
            merge_fields : {
              FNAME : first_name,
              LNAME : last_name
            }
          }
        };     

        Object.assign(responseBody, _.pick(req.body, 'first_name', 'last_name'));

        res.status(201).json(responseBody);
      })
     .catch((err) => {
        return res.status(400).send({url: `${req.originalUrl} bad request`, error: err});
      });
  } 
}
