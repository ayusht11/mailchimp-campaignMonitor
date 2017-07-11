import request from 'request';

export default class RequestHandler {
  static post (requestBody, userInfo, path = "", query = {}) {
    return new Promise((resolve, reject) => {
      let completeUrl = userInfo.baseUrl + path;
      request({
        url: completeUrl,
        form: query,
        method: 'POST',
        json: requestBody
      }, (err, response, data) => {
        if(err) {
          return reject(err);
        }
        resolve(data);            
      })
       .auth(userInfo.username, userInfo.password, true); 
    })
  }

  static get (userInfo, path = "", query = {}) {
    return new Promise((resolve, reject) => {
      let completeUrl = userInfo.baseUrl + path;
      request({
        url: completeUrl,
        form: query,
        method: 'GET'
      }, (err, response, data) => {
        if(err) {
          return reject(err);
        }
        resolve(data);            
      })
       .auth(userInfo.username, userInfo.password, true); 
    })
  }  
}
