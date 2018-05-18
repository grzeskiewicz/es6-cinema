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
        const customerInfo = document.querySelector('#customer-info');
        view.hide(customerInfo);
        loginCtrl.getInfo();
        showingsCtrl.list(showings);
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
        element.style.display = 'flex';
    },
    hide(element) {
       // element.style.display = 'none';
        element.classList.add('visuallyhidden');
    },
    toggle(element) {
        element.style.display = element.style.display === 'none' ? 'flex' : 'none';
    }
}

const showingsCtrl = {
    showingsDiv() { return document.querySelector('#showings'); },
    showingsList() { return document.querySelectorAll('.showing'); },
    details() { return document.querySelector('#details'); },
    dateParser(stringdate) {
        return moment(stringdate).format("DD.MM.YYYY, HH:mm");
    },
    dateDisplay(showings) {
        showings = showings.sort((a, b) => {
            return moment(a.date) - moment(b.date);
        });
        for (const showing of showings) {
            showing.date = this.dateParser(showing.date);
        }
    },
    list(showings) {
        this.dateDisplay(showings);
        view.renderContent("entry-template", JSON.parse(`{ "showings": ${JSON.stringify(showings)}}`), "showings");

        [...this.showingsList()].forEach(showing => {
            view.hide(showing.querySelector('.showing-details'));
            view.hide(showing.querySelector('.poster'));
            showing.addEventListener('click', event => {
                event.preventDefault();
                const detailsDiv = this.details();
                view.show(detailsDiv);
                detailsDiv.querySelector('#close').addEventListener('click', function() {
                    detailsDiv.classList.remove('activeshow');
                    showingsCtrl.showingsDiv().classList.remove('blur');
                    view.hide(detailsDiv);
                });

                detailsDiv.classList.add('activeshow');
                showing.classList.add('active');
                const showingDetails = showing.querySelector('.showing-details');
                console.log(showingDetails);
                const poster = showing.querySelector('.poster');
                showingDetails.style.display = 'block';
                showingDetails.classList.add('fadein');
                showing.querySelector('.showing-wrapper').classList.add('fadein');
                showing.classList.add('fadein');
                poster.style.display = 'block';
                [...this.showingsList()].forEach(showingObj => {
                    if (showingObj.classList.contains('active') && showingObj !== showing) {
                        showingObj.classList.remove('active');
                    }
                    const showingObjDetails = showingObj.querySelector('.showing-details');
                    const showingObjPoster = showingObj.querySelector('.poster');
                    if (showingObjDetails.style.display === 'block' && showingObjDetails !== showingDetails) {
                        showingObjDetails.style.display = 'none';
                        showingObjPoster.style.display = 'none';
                    }

                });
                this.showingsDiv().classList.add('blur');
                showingsService.selectById(event.currentTarget.dataset.showingId);
                //const seatsDiv = document.getElementById('seats');
                //view.hide(seatsDiv);
                view.renderContent("entry-template-seats", event.currentTarget.dataset, "seats");
                seatsCtrl.disableListener();
                seatsCtrl.selectedSeats = [];
                document.getElementById("order").innerHTML = "";
                seatsCtrl.toggleListener();
                orderCtrl.orderListener();
                const nextBtn = document.getElementById("nextBtn");
                view.hide(nextBtn);
            }, false);
        });
    }

}

const seatsCtrl = {
    seats: document.getElementsByClassName("seat"),
    seatsDiv: document.getElementById('seats'),
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
                view.show(this.seatsDiv);
            });
    }
}



const orderCtrl = {
    orderDiv() { return document.querySelector('#order'); },
    pricing() {
        const price = document.forms['order-form'].price.value === "normal" ? showingsService.getSelected().normal : showingsService.getSelected().discount;
        const priceTotal = price * seatsCtrl.selectedSeats.length;
        document.querySelector('#total-price').innerHTML = `Total price to pay: ${priceTotal}`;
    },
    orderListener() {
        const nextBtn = document.getElementById("nextBtn");
        nextBtn.addEventListener('click', event => {
            const obj = { showing: showingsService.getSelected(), seatsSelected: seatsCtrl.selectedSeats };
            view.renderContent("entry-template-order", obj, "order");
            view.renderContent("entry-template-login", obj, "login");
            view.renderContent("entry-template-register", obj, "register");
            const registerForm = document.forms['register-form'];
            registerForm.addEventListener('submit', registerCtrl.signup, false);
            const loginForm = document.forms['login-form'];
            loginForm.addEventListener('submit', loginCtrl.login, false);
            const orderForm = document.forms['order-form'];
            this.pricing();
            orderForm['price'].addEventListener('change', orderCtrl.pricing);
            orderForm.addEventListener('submit', ticketCtrl.order, false);
        });
    }
}


const ticketCtrl = {
    order(event) {
        const orderForm = this;
        event.preventDefault();
        loginCtrl.getInfo().then(email => {
            if (email === undefined) {
                document.getElementById("order-status").innerHTML = "Please login to order tickets!";
                view.hide(document.querySelector('#seats'));

            } else {
                const ticket = {
                    showing: showingsService.getSelected().id,
                    seats: seatsCtrl.selectedSeats,
                    price: orderForm['price'].value === "normal" ? showingsService.getSelected().normal : showingsService.getSelected().discount,
                    email: email,
                };
                console.log(ticket);
                fetch(request(`${API_URL}newticket`, 'POST', ticket))
                    .then(res => res.json())
                    .then(result => {
                        const seatsDiv = document.getElementById('seats');
                        //view.hide(orderForm);
                        document.querySelector('#details').classList.add('ordered');
                        orderForm.innerHTML = result.msg;
                        view.hide(seatsDiv);
                        console.log(result);
                    }).catch(error => Promise.reject(new Error(error)));
            }
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
                    //  console.log(res.msg);
                }

            });
    }
}


const loginCtrl = {

    getInfo() {
        const loginDiv = document.querySelector('#login');
        const registerDiv = document.querySelector('#register');
        const customerInfoEmail = document.querySelector('#customer-info-email');
        const customerInfo = document.querySelector('#customer-info');
        const logoutButton = document.querySelector('#logout');
        logoutButton.addEventListener('click', loginCtrl.logout, false);
        return fetch(request(`${API_URL}memberinfo`, 'GET'))
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    customerInfoEmail.innerHTML = result.msg;
                    view.hide(loginDiv);
                    view.hide(registerDiv);
                    view.show(customerInfo);
                    //console.log("FETCH: " + result.msg);
                    return result.msg;
                } else {
                    // console.log("Error getInfo:");
                    // console.log(result);
                }
            });
    },
    // register() { $state.go('register'); },
    login(event) {
        event.preventDefault();
        const loginForm = document.forms['login-form'];
        //console.log(loginForm);
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
                    //console.log(this);
                    loginCtrl.getInfo();

                } else {
                    loginStatus.classList.add('error');
                    loginStatus.innerHTML = res.msg;
                    //console.log(res);
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
        const customerInfo = document.querySelector('#customer-info');
        const customerInfoEmail = document.querySelector('#customer-info-email');
        customerInfoEmail.innerHTML = "";
        view.hide(customerInfo);
        authServices.logout();
        view.show(loginDiv);
        view.show(registerDiv);
        //$rootScope.noshowlogin=false;
        //$state.go('login');
        //$rootScope.memberinfo2=undefined;
        //$scope.memberinfo=undefined;
    }

}