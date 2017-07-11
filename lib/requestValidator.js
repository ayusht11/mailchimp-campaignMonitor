import MailchimpHandler from './../app/controllers/mailchimpHandler';
import CampaignMonitorHandler from './../app/controllers/campaignMonitorHandler';

const requestValidator = (req, res, next) => {
  if(req.header('service_provider') === 'mailchimp') {
    console.log(`Processing request for : ${req.header('service_provider')}`);
    req.instanceHandler = new MailchimpHandler('https://us16.api.mailchimp.com/3.0/', req, res);
  }
  else if( req.header('service_provider') === 'campaignMonitor') {
    console.log(`Processing request for : ${req.header('service_provider')}`);
    req.instanceHandler = new CampaignMonitorHandler('https://api.createsend.com/api/v3.1/', req, res);
  }
  else res.status(400).send({err: `${req.header('service_provider')} should be either mailchimp or campaignMonitor`});

  next();
}

export default requestValidator;
