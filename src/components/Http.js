const url = 'http://192.168.0.106:8000/'
const urlx = 'https://ness2.herokuapp.com/'   

const send = async (method, endpoint, body, token, signal) => {
    let response;
    let options = {}
    let headers = new Headers({ 'Content-Type': 'application/json' });

    if(token != null) { 
        headers.append('x-access-token', token);
    } 

    (signal != null) 
    ? options = { method, signal, mode: 'cors', headers }
    : options = { method, mode: 'cors', headers }; 
     
    (body == null) 
    ? response = await fetch(url + endpoint, options)
    : response = await fetch(url + endpoint, { ...options, body: JSON.stringify(body) });
    
    return await response.json(); 
}

export default {
    send
}