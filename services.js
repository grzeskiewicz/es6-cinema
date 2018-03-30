import { API_URL, request } from './apiconnection.js'; //request
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
        var token = window.localStorage.getItem(this.LOCAL_TOKEN_KEY);
        if (token) {
            this.useCredentials(token);
        }
    },

    storeUserCredentials(token) {
        window.localStorage.setItem(this.LOCAL_TOKEN_KEY, token);
        this.useCredentials(token);
    },

    useCredentials(token) {
        this.isAuthenticated = true;
        this.authToken = token;

        // Set the token as header for your requests!
        $http.defaults.headers.common.Authorization = authToken;
    },

    destroyUserCredentials() {
        this.authToken = undefined;
        this.isAuthenticated = false;
        $http.defaults.headers.common.Authorization = undefined; //!!!!
        window.localStorage.removeItem(this.LOCAL_TOKEN_KEY);
    },

    register(user) {
        const headerz = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            // "Access-Control-Allow-Origin": "*"
        });
        console.log(JSON.stringify(user));
        return fetch(request(`${API_URL}registertest`, 'POST', user, headerz))
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
                    return result.msg;
                }
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