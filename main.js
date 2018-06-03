import { authServices } from './services.js';
import { API_URL, request } from './apiconnection.js';
import { calendarDiv, renderWeek, renderCalendar, calendard, yearNow, selectedMonth, monthNow, createCalendar } from './calendar.js';

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


fetch(request(API_URL + "showings", 'GET'))
    .then(res => res.json())
    .then(showings => {
        calendarCtrl.initCalendar();
        showingsService.add(showings);
        authServices.loadUserCredentials();
        const customerInfo = document.querySelector('#customer-info');
        view.hide(customerInfo);
        loginCtrl.getInfo();
    });

const view = {
    renderContent(source, context, output) {
        let sourceElem = document.getElementById(source).innerHTML;
        let template = Handlebars.compile(sourceElem);
        let html = template(context);
        document.getElementById(output).innerHTML = html;
        //document.getElementById(output).appendChild(html);
        //console.log(document.getElementById(output).innerHTML);
    },
    show(element) {
        // element.classList.remove('visuallyhidden').add('visuallyvisible');
        element.style.display = 'flex';
    },
    hide(element) {
        element.style.display = 'none';
        //element.classList.remove('visuallyvisible').add('visuallyhidden');
    },
    toggle(element) {
        element.style.display = element.style.display === 'none' ? 'flex' : 'none';
    }
}
let selectedMonthCopy = selectedMonth;
const calendarCtrl = {
    initListeners(calendarTable) {
        const daysArray = calendarTable.querySelectorAll('tbody td');
        for (const day of daysArray) {
            day.addEventListener('click', function() {
                const pickedDate = new Date(this.dataset.date);
                showingsCtrl.calendarShowings(pickedDate);
                day.classList.add('date-clicked')
                for (const day2 of daysArray) {
                    if (day2.classList.contains('date-clicked') && day2 !== day) {
                        day2.classList.remove('date-clicked');
                    }
                }

            });
        }
    },
    initListenersMonths() {
        const previous = document.querySelector('#previous');
        const next = document.querySelector('#next');
        selectedMonthCopy <= monthNow ? previous.style.display = 'none' : previous.style.display = 'inline';
        previous.addEventListener('click', function() {
            calendarDiv.innerHTML = '';
            let calendarTable = renderCalendar(createCalendar(yearNow, --selectedMonthCopy));
            calendarCtrl.initListeners(calendarTable);
            calendarCtrl.initListenersMonths();
        });
        next.addEventListener('click', function() {
            calendarDiv.innerHTML = '';
            let calendarTable = renderCalendar(createCalendar(yearNow, ++selectedMonthCopy));
            calendarCtrl.initListeners(calendarTable);
            calendarCtrl.initListenersMonths();
        });
    },
    initCalendar() {
        renderWeek(calendard);
        let calendarTable = renderCalendar(calendard);
        this.initListeners(calendarTable);
        this.initListenersMonths();
    }
}



export const showingsCtrl = {
    showingsDiv() { return document.querySelector('#showings'); },
    showingsList() { return document.querySelectorAll('.showing'); },
    titlesList() { return document.querySelectorAll('.title'); },
    details() { return document.querySelector('#details'); },
    dateParser(stringdate) {
        const dateFormat = 'DD.MM.YYYY, HH:mm';
        return moment(stringdate, 'YYYY-MM-DDThh:mm:ssZ').format(dateFormat);
    },
    sortShowings(sList) {
        sList = sList.sort((a, b) => {
            return moment(a.date) - moment(b.date);
        });
    },
    groupShowings(sList) {
        const group = [];
        for (const showing of sList) {
            if (group[showing['title']] === undefined) group[showing['title']] = [];
            group[showing['title']].push(showing);
        }

        const groupedShowingsArray = [];
        const titleList = [];
        for (let key in group) {
            titleList.push(key);
            groupedShowingsArray.push(group[key]);
        }
        /*  const finallist = [];
          for (const elem of groupedShowingsArray) {
              for (const el of elem) {
                  finallist.push(el);
              }
          }*/
        return [titleList, group];
    },
    calendarShowings(pickedDate) {

        const parsedPickedDate = moment(pickedDate).format('YYYY-MM-DD');
        const showings = showingsService.list()[0];
        const result = [];
        for (const showingElem of showings) {
            if (showingElem.date.includes(parsedPickedDate)) {
                let showcopy = JSON.parse(JSON.stringify(showingElem));
                showcopy.date = this.dateParser(showcopy.date);
                result.push(showcopy);
            }
        }
        showingsCtrl.list(result);
        seatsCtrl.toggleListener();

    },
    list(showings) {
        this.sortShowings(showings);
        const titles = this.groupShowings(showings);
        view.renderContent("entry-template-titles", JSON.parse(`{ "showings": ${JSON.stringify(titles[0])}}`), "showings");
        [...this.titlesList()].forEach(title => {
            title.addEventListener('click', function() {
                view.renderContent("entry-template", JSON.parse(`{ "showings": ${JSON.stringify(titles[1][title.textContent])}}`), "showlist"); //list of hours of selected showing
                view.renderContent("entry-template-film", JSON.parse(`{ "showings": ${JSON.stringify(titles[1][title.textContent][0])}}`), "film"); //description of the film
                [...showingsCtrl.showingsList()].forEach(showing => {

                    //view.hide(showing.querySelector('.showing-details'));
                    //view.hide(showing.querySelector('.poster'));
                    showing.addEventListener('click', event => {
                        console.log(this);
                        event.preventDefault();
                        const detailsDiv = showingsCtrl.details();
                        view.show(detailsDiv);
                        /* detailsDiv.querySelector('#close').addEventListener('click', function() {
                             detailsDiv.classList.remove('activeshow');
                             showingsCtrl.showingsDiv().classList.remove('blur');
                             view.hide(detailsDiv);
                         });*/

                        detailsDiv.classList.add('activeshow');
                        showing.classList.add('active');
                        const showingDetails = showing.querySelector('.showing-details');
                        const poster = showing.querySelector('.poster');
                        showingDetails.style.display = 'block';
                        poster.style.display = 'block';
                        [...showingsCtrl.showingsList()].forEach(showingObj => {
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
                        showingsCtrl.showingsDiv().classList.add('blur');
                        showingsService.selectById(event.currentTarget.dataset.showingId);
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
            });
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
                } else {
                    let seatToRemoveIndex = this.selectedSeats.findIndex(element => element === event.target.firstChild.data);
                    this.selectedSeats.splice(seatToRemoveIndex, 1);

                    if (this.selectedSeats.length == 0) { view.hide(nextBtn); }
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