import { API_URL, request, headers } from './apiconnection.js'; //request


export const authServices = {
    LOCAL_TOKEN_KEY: 'yourTokenKey',
    isAuthenticated: false,
    authToken: undefined,

    loadUserCredentials() {
        var token = window.localStorage.getItem(this.LOCAL_TOKEN_KEY);
        if (token) {
            this.useCredentials(token);
        }
    },

    storeUserCredentials(token) {
        console.log("HEHE JESTEM TU");
        window.localStorage.setItem(this.LOCAL_TOKEN_KEY, token);
        this.useCredentials(token);
    },

    useCredentials(token) {
        this.isAuthenticated = true;
        this.authToken = token;
       // console.log(token);
       // console.log(this.authToken);
        headers.append('Authorization', this.authToken);
        // Set the token as header for your requests!
        //$http.defaults.headers.common.Authorization = authToken;
    },

    destroyUserCredentials() {
        this.authToken = undefined;
        this.isAuthenticated = false;
        headers.delete('Authorization');
        // $http.defaults.headers.common.Authorization = undefined; //!!!!
        window.localStorage.removeItem(this.LOCAL_TOKEN_KEY);
    },

    register(user) {
        console.log(JSON.stringify(user));
        return fetch(request(`${API_URL}registertest`, 'POST', user))
            .then(res => res.json())
            .then(result => result)
            .catch(error => Promise.reject(new Error(error))); //Promise.reject(new Error(error))       
    },

    login(user) { //token? JWT!

        return fetch(request(`${API_URL}logintest`, 'POST', user))
            .then(res => res.json())
            .then(result => {
                if (result.success) { // result.ok?
                    this.storeUserCredentials(result.token);
                    console.log(result);
                    return result;
                } else { return result; }
            }).catch(error => Promise.reject(new Error(error)));
        /*return $q(function(resolve, reject) {
            $http.post(`${{API_URL}}/login`, user).then(function(result) {
                if (result.data.success) {
                    storeUserCredentials(result.data.token);
                    console.log(result.data.token);
                    resolve(result.data.msg);
                } else {
                    reject(result.data);
                }
            });
        });*/
    },

    logout() {
        this.destroyUserCredentials();
    }

    //loadUserCredentials();

}