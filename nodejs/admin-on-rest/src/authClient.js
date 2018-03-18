// in src/authClient.js
import { AUTH_LOGIN, AUTH_CHECK, AUTH_ERROR } from 'admin-on-rest';

export default (type, params) => {
    if (type === AUTH_LOGIN) {
		const { username, password } = params;
		var token = btoa(username + ":" + password);
        localStorage.setItem('token', token);
		
		const request = new Request('http://howell-info.us:3001', {
            method: 'GET',
            headers: new Headers({ 'Authorization' : `Basic ${token}` })
        })
		return fetch(request).then(reply => {
			
			if(reply.status === 401 || reply.status === 403){
				throw new Error(reply.statusText);
			}
			//return reply.json();
			
		})
    }
	if (type === AUTH_CHECK) {
        return localStorage.getItem('token') ? Promise.resolve() : Promise.reject();
    }
	
	if (type === AUTH_ERROR) {
        const { status } = params;
        if (status === 401 || status === 403) {
            localStorage.removeItem('token');
            return Promise.reject();
        }
        return Promise.resolve();
    }
	
    return Promise.resolve();
}