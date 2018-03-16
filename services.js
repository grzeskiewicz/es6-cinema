import { API_URL } from './apiconnection.js'; //request
/*const seatServices = {
    pickedSeats: { //testable
        pickedSeats: [],
        add(seat) {
            let index = pickedSeats.indexOf(seat);
            (index >= 0) ? this.pickedSeats.splice(index, 1): this.pickedSeats.push(seat);

        },
        list() { return this.pickedSeats; },
        seat() { return this.pickedSeats[0] },
        remove() { this.pickedSeats = []; }
    },
    seatsTaken: { //same object like picedSeats, maybe Object.create(pattern)?
        seatsTaken: [],
        add(arr) {
            this.seatsTaken.push(seat);
        },
        list() { return this.seatsTaken; },
        seat() { return this.seatsTaken[0] },
        remove() { this.seatsTaken = []; }
    },

}


const listServices = {
    listService: { //same object like picedSeats, maybe Object.create(pattern)?
        elemArray: [],
        add(elem) {
            this.elemArray.push(elem);
        },        
        addNoRepeat(elem) {
            let index = elemArray.indexOf(elem);
            (index >= 0) ? this.elemArray.splice(index, 1): this.elemArray.push(elem);

        },
        list() { return this.elemArray; },
        first() { return this.elemArray[0] },
        remove() { this.elemArray = []; }
    }

}*/






export const authServices = {
    LOCAL_TOKEN_KEY: 'yourTokenKey',
    isAuthenticated: false,
    authToken: undefined,

    loadUserCredentials() {
        var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
        if (token) {
            useCredentials(token);
        }
    },

    storeUserCredentials(token) {
        window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
        useCredentials(token);
    },

    useCredentials(token) {
        isAuthenticated = true;
        authToken = token;

        // Set the token as header for your requests!
        $http.defaults.headers.common.Authorization = authToken;
    },

    destroyUserCredentials() {
        authToken = undefined;
        isAuthenticated = false;
        $http.defaults.headers.common.Authorization = undefined; //!!!!
        window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    },

    register(user) {
        console.log(user);
        /*fetch(request(`${API_URL}signUp`, 'POST', user))
            .then(res => { return res.json();})
            .then(result => {
                console.log(result);
                if (result.data.success) { // result.ok?
                    return result.data.msg;
                }
                return Promise.reject(new Error('error'))
            }).catch(error => console.log(error)); //Promise.reject(new Error(error)) */
        const url = `${API_URL}signUp`;
        const headerss = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        });

        const requestt = new Request(url, {
            method: 'POST',
            mode: 'cors',
            header: headerss,
            body: JSON.stringify(user)
        })

        fetch(request)
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.log('There was an error:', error));


        //fetch(request(`${API_URL}signUp`, 'POST', user)).then(res=>console.log(res));


        /*  return $q(function(resolve, reject) {
              $http.post(`${{API_URL}}/signUp`, user).then(function(result) {
                  console.log(result);
                  if (result.data.success) {
                      resolve(result.data.msg);
                  } else {
                      reject(result.data.msg);
                  }
              });
          });*/
    },

    login(user) { //token? JWT!
        fetch(request(`${API_URL}/login`, 'POST', user))
            .then(res => res.json())
            .then(result => {
                if (result.data.success) { // result.ok?
                    storeUserCredentials(result.data.token);
                    //console.log(result.data.token);
                    return result.data.msg;
                }
                return Promise.reject(Error('error'))
            }).catch(error => Promise.reject(Error(error.message)));
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
        destroyUserCredentials();
    }

    //loadUserCredentials();

}






/*
const loginCtrl = {
    user: {
        email: '',
        password: ''
    },
    register() { $state.go('register'); },
    login() {
        AuthService.login(this.user).then(function(msg) {
            // $rootScope.noshowlogin=true;
            //$scope.getInfo();
        }, function(errMsg) {
            // $scope.error=true;
            //$scope.errorMsg=errMsg.msg;
            // if (errMsg.wrongpassword==true) {$scope.errorpassword=true;}
        });
    },
    destrySession() { authServies.logout(); },
    getInfo() {
        fetch(`${API_ENDPOINT}/memberinfo`, 'GET').then(function(result) {
            if (result.data.success) {
                $rootScope.noshowlogin = true;
                $scope.memberinfo = result.data.msg;
                $rootScope.memberinfo2 = result.data.msg;
                $state.go('order');
            }
        });

    },
    logout() {
        authServies.logout();
        //$rootScope.noshowlogin=false;
        //$state.go('login');
        //$rootScope.memberinfo2=undefined;
        //$scope.memberinfo=undefined;
    }

}
const registerCtrl = {
    user: {
        email: '',
        password: '',
        name: '',
        surename: '',
        telephone: ''
    },
    signup() {
        authServies.register(this.user).then(msg => {
            //$state.go('login');
            console.log(`Registration msg ${msg}`);
        }, errMsg => {
            //fails
        });
    }
}



const orderCtrl2 = {
    //seats: seatServices.pickedSeats.list(),
    seats: seatsCtrl.selectedSeats,
    price: undefined,
    logout() {
        authServies.logout();
    },
    updatePrice() {
        if (formobj.singleSelect === "normal") { this.price = showingpicked.normal; }
        if (formobj.singleSelect === "discount") { this.price = showingpicked.discount; }
        orderReady = true;
    },
    processForm() {
        let ticket = {
            showing: $rootScope.showingId, //!!
            seat: this.seats,
            price: this.price,
            email: $rootScope.memberinfo2 //!!
        };
        fetch(request(`${API_URL}/newticket`, 'POST', ticket))
            .then(res => res.json())
            .then(result => {
                if (result.data.success) { // result.ok?
                    return result.data.msg;
                }
                return Promise.reject(Error('error'))
            }).catch(error => Promise.reject(Error(error.message)));
    }
}

*/