import { authServices } from './services.js';
import { API_URL, request } from './apiconnection.js';

Handlebars.registerHelper('for', function(from, to, block) {
    var accum = '';
    for (var i = from; i <= to; i++)
        accum += block.fn(i);
    return accum;
});


const listService = { //same object like picedSeats, maybe Object.create(pattern)?
    elemArray: [],
    selectedElem: undefined,
    add(elem) {
        this.elemArray.push(elem);
    },
    addNoRepeat(elem) {
        let index = elemArray.indexOf(elem);
        (index >= 0) ? this.elemArray.splice(index, 1): this.elemArray.push(elem);

    },
    selectById(id) {

        this.selectedElem = this.elemArray[0].find(element => Number(element.id) === Number(id));
        // console.log(this.selectedElem);
    },
    list() { return this.elemArray; },
    first() { return this.elemArray[0] },
    remove() { this.elemArray = []; },
    getSelected() { return this.selectedElem }
}
const showingsService = Object.create(listService);










// MAIN PART =======================================================================================================================================================






fetch(request(API_URL + 'showings', 'GET'))
    .then(res => res.json())
    .then(showings => {
        authServices.loadUserCredentials();
        loginCtrl.getInfo();
        let shows = `{ "showings": ${JSON.stringify(showings)}}`;
        showingsCtrl.list(JSON.parse(shows));
        seatsCtrl.toggleListener();
        showingsService.add(showings);
    });



const view = {
    renderContent(source, context, output) {
        let sourceElem = document.getElementById(source).innerHTML;
        let template = Handlebars.compile(sourceElem);
        let html = template(context);
        document.getElementById(output).innerHTML = html;
    },
    show(element) {
        element.style.display = 'block';
    },
    hide(element) {
        element.style.display = 'none';
    }
}

const showingsCtrl = {
    showingsList: document.getElementsByTagName("a"),
    list(showings) {
        view.renderContent("entry-template", showings, "showings");
        [...this.showingsList].forEach(showing => {
            showing.addEventListener('click', event => {
                const nextBtn = document.getElementById("nextBtn");
                view.hide(nextBtn);
                event.preventDefault();
                view.renderContent("entry-template-seats", event.currentTarget.dataset, "seats");
                seatsCtrl.selectedSeats = [];
                document.getElementById("order").innerHTML = "";
                seatsCtrl.toggleListener();

                orderCtrl.orderListener();
                //console.log(event.currentTarget.dataset.showingId);
                showingsService.selectById(event.currentTarget.dataset.showingId);
                seatsCtrl.disableListener();
            }, false);
        });
    }

}

const seatsCtrl = {
    seats: document.getElementsByClassName("seat"),
    selectedSeats: [],
    toggleListener() {
        [...this.seats].forEach(seat => {
            seat.addEventListener('click', event => {
                const nextBtn = document.getElementById("nextBtn");
                event.target.classList.toggle('selected');
                if (event.target.classList.contains('selected')) {
                    this.selectedSeats.push(event.target.firstChild.data);
                    view.show(nextBtn);
                    //console.log(this.selectedSeats);
                } else {
                    let seatToRemoveIndex = this.selectedSeats.findIndex(element => element === event.target.firstChild.data);
                    this.selectedSeats.splice(seatToRemoveIndex, 1);

                    if (this.selectedSeats.length == 0) { view.hide(nextBtn); }
                    //console.log(this.selectedSeats);
                }
            });
        })
    },
    disableListener() {
        fetch(request(`${API_URL}seatstaken/${showingsService.getSelected().id}`, 'GET'))
            .then(res => res.json())
            .then(seatstaken => {
                for (const seat of seatstaken) {
                    document.getElementById(Number(seat)).disabled = true;
                    //set button to disabled
                }

            });
    }
}



const orderCtrl = {
    orderListener() {
        const nextBtn = document.getElementById("nextBtn");
        nextBtn.addEventListener('click', event => {
            //console.log(seatsCtrl.selectedSeats);
            //console.log(showingsService.getSelected());
            const obj = { showing: showingsService.getSelected(), seatsSelected: seatsCtrl.selectedSeats };
            view.renderContent("entry-template-order", obj, "order");
            view.renderContent("entry-template-login", obj, "login");
            view.renderContent("entry-template-register", obj, "register");
            const registerForm = document.forms['register-form'];
            registerForm.addEventListener('submit', registerCtrl.signup, false);
            const loginForm = document.forms['login-form'];
            loginForm.addEventListener('submit', loginCtrl.login, false);
            const orderBtn = document.querySelector('#order-ticket');
            orderBtn.addEventListener('click', ticketCtrl.order, false);
        });
    }
}


const ticketCtrl = {
    order() {
        loginCtrl.getInfo().then(email => {
            const ticket = {
                showing: showingsService.getSelected().id,
                seats: seatsCtrl.selectedSeats,
                price: 30,
                email: email,
            };
            console.log(ticket);
            fetch(request(`${API_URL}newticket`, 'POST', ticket))
                .then(res => res.json())
                .then(result => {
                    const orderBtn = document.querySelector('#order-ticket');
                    const seatsDiv = document.querySlector('#seats');
                    view.hide(orderBtn);
                    view.hide(seatsDiv);
                    console.log(result);
                }).catch(error => Promise.reject(new Error(error)));
        });

    }

}

const registerCtrl = {
    signup(event) {
        event.preventDefault();
        const registerForm = document.forms['register-form'];
        const registerStatus = document.querySelector('#register-status');
        let user = {
            email: registerForm.email.value,
            password: registerForm.password.value,
            name: registerForm.name.value,
            surename: registerForm.surename.value,
            telephone: registerForm.telephone.value
        };
        authServices.register(user)
            .then(res => {
                if (res.success) {
                    registerStatus.innerHTML = res.msg;
                    registerStatus.classList.add('success');
                    view.hide(registerForm);
                } else {
                    registerStatus.innerHTML = res.msg;
                    registerStatus.classList.add('error');
                    console.log(res.msg);
                }

            });
    }
}


const loginCtrl = {

    getInfo() {
        const loginDiv = document.querySelector('#login');
        const registerDiv = document.querySelector('#register');
        const customerInfoEmail = document.querySelector('#customer-info-email');
        const logoutButton = document.querySelector('#logout');
        logoutButton.addEventListener('click', loginCtrl.logout, false);
        return fetch(request(`${API_URL}memberinfo`, 'GET'))
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    customerInfoEmail.innerHTML = result.msg;
                    view.hide(loginDiv);
                    view.hide(registerDiv);
                    console.log("FETCH: " + result.msg);
                    return result.msg;
                } else {
                    console.log("Lol cos tu" + result);
                }
            });
    },
    // register() { $state.go('register'); },
    login(event) {
        event.preventDefault();
        const loginForm = document.forms['login-form'];
        console.log(loginForm);
        const loginStatus = document.querySelector('#login-status');
        let user = {
            email: loginForm.email.value,
            password: loginForm.password.value
        };
        authServices.login(user)
            .then(res => {
                if (res.success) {
                    loginStatus.classList.add('success');
                    loginStatus.innerHTML = res.msg;
                    console.log(this);
                    loginCtrl.getInfo();

                } else {
                    loginStatus.classList.add('error');
                    loginStatus.innerHTML = res.msg;
                    console.log(res);
                }
                // $rootScope.noshowlogin=true;
                //$scope.getInfo();

                // $scope.error=true;
                //$scope.errorMsg=errMsg.msg;
                // if (errMsg.wrongpassword==true) {$scope.errorpassword=true;}
            });
    },
    destrySession() { authServies.logout(); },

    logout() {
        const loginDiv = document.querySelector('#login');
        const registerDiv = document.querySelector('#register');
        const customerInfoEmail = document.querySelector('#customer-info-email');
        customerInfoEmail.innerHTML = "";
        authServices.logout();
        view.show(loginDiv);
        view.show(registerDiv);
        //$rootScope.noshowlogin=false;
        //$state.go('login');
        //$rootScope.memberinfo2=undefined;
        //$scope.memberinfo=undefined;
    }

}