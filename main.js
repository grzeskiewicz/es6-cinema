import { authServices } from './services.js';
import { API_URL, request } from './apiconnection.js';
import { calendarDiv, renderWeek, renderCalendar, calendarObj, yearNow, selectedMonth, monthNow, createCalendar } from './calendar.js';
const IMAGE_URL = 'https://cinema-node-bucket.s3.amazonaws.com/';
const socket = io('https://cinema-node.herokuapp.com');


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
        this.selectedElem = this.first().find(element => Number(element.id) === Number(id));
    },
    list() { return this.elemArray; },
    first() { return this.elemArray[0] },
    remove() { this.elemArray = []; },
    getSelected() { return this.selectedElem }
}

const showingsService = Object.create(listService);




// MAIN PART =======================================================================================================================================================
const view = {
    renderContent(source, context, output) {
        const sourceElem = document.getElementById(source).innerHTML;
        const template = Handlebars.compile(sourceElem);
        const html = template(context);
        document.getElementById(output).innerHTML = html;
    },
    show(element) {
        element.style.display = ''
    },
    showFlex(element) {
        element.style.display = 'flex';
    },
    hide(element) {
        element.style.display = 'none';
    },
    toggle(element) {
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }
}


//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<INIT >>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function initApp() {
    fetch(request(API_URL + "showings", 'GET'))
        .then(res => res.json())
        .then(showings => {
            //authServices.loadUserCredentials();
            //loginCtrl.getInfo();
            const customerInfo = document.querySelector('#customer-info');
            console.log(customerInfo);
            view.hide(customerInfo);

            view.show(calendarCtrl.calendarDiv);
            view.hide(showingsCtrl.showingsWrapper);
            showingsService.remove();
            showingsService.add(showings);

            calendarCtrl.initCalendar();


        });

}

initApp();


//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<INIT >>>>>>>>>>>>>>>>>>>>>>>>>>>>>




let selectedMonthCopy = selectedMonth;
console.log(selectedMonthCopy);
const calendarCtrl = {
    calendarDiv: document.querySelector('#calendar'),
    d: Number(yearNow),
    initListeners(calendarTable) {

        const daysArray = calendarTable.querySelectorAll('tbody td');
        for (const day of daysArray) {
            if (!day.classList.contains('not-selectable')) {
                day.addEventListener('click', function() {
                    const pickedDate = new Date(this.dataset.date);
                    view.hide(showingsCtrl.showList);
                    view.hide(showingsCtrl.detailsDiv);

                    const showings = showingsCtrl.calendarShowings(pickedDate); //FIRST STEP 
                    showingsCtrl.showList.innerHTML = '';
                    view.show(showingsCtrl.showList);
                    if (showings.length > 0) {
                        view.show(showingsCtrl.showingsWrapper);
                        view.show(showingsCtrl.detailsDiv);
                        view.show(showingsCtrl.filmTitles);
                    } else {
                        view.hide(showingsCtrl.showingsWrapper);
                    }
                    day.classList.add('date-clicked')
                    for (const day2 of daysArray) {
                        if (day2.classList.contains('date-clicked') && day2 !== day) {
                            day2.classList.remove('date-clicked');
                        }
                    }
                });
            }
        }


    },
    initListenersMonths() {

        const previous = document.querySelector('#previous');
        const next = document.querySelector('#next');
        selectedMonthCopy <= monthNow && calendarCtrl.d == yearNow ? previous.style.display = 'none' : previous.style.display = 'inline';
        (selectedMonthCopy > monthNow + 2 || calendarCtrl.d > yearNow) ? next.style.display = 'none': next.style.display = 'inline';
        previous.addEventListener('click', function() {
            calendarDiv.innerHTML = '';
            if (calendarCtrl.d > yearNow) {
                calendarCtrl.d--;
                selectedMonthCopy = 12;
            }
            let calendarTable = renderCalendar(createCalendar(yearNow, --selectedMonthCopy));
            calendarCtrl.initListeners(calendarTable);
            calendarCtrl.initListenersMonths();
        });
        next.addEventListener('click', function() {
            calendarDiv.innerHTML = '';
            if (selectedMonthCopy >= 11) {
                calendarCtrl.d++;
                selectedMonthCopy = -1;
            }
            let calendarTable = renderCalendar(createCalendar(calendarCtrl.d, ++selectedMonthCopy));
            calendarCtrl.initListeners(calendarTable);
            calendarCtrl.initListenersMonths();
        });
    },
    initCalendar() {
        let calendarTable = renderCalendar(calendarObj);
        this.initListeners(calendarTable);
        this.initListenersMonths();
    }
}



export const showingsCtrl = {
    showingsDiv: document.querySelector('#showings'),
    showingsWrapper: document.querySelector('#showings-wrapper'),
    detailsDiv: document.querySelector('#details'),
    showList: document.querySelector('#showlist'),
    showingsList: document.getElementsByClassName('showing'), //function because of handlebars
    titlesList: document.getElementsByClassName('title'), //function because of handlebars
    filmTitles: document.querySelector('#film-titles'),
    backCalendarBtn() { return document.querySelector('#backCalendarBtn'); },
    goBackToTitlesBtn() { return document.querySelector('#backTitles'); },
    dateParser(stringdate) {
        const dateFormat = 'HH:mm';
        return moment(stringdate).format(dateFormat);
    },
    sortShowings(sList) {
        sList = sList.sort((a, b) => {
            return moment(a.date, "HH:mm") - moment(b.date, "HH:mm");
        });

    },
    groupShowings(sList) {
        const groupedByTitle = [];
        const titleList = [];

        for (const showing of sList) { //putting showings by the titles' names
            if (groupedByTitle[showing['title']] === undefined) groupedByTitle[showing['title']] = [];
            groupedByTitle[showing['title']].push(showing);
        }

        for (let key in groupedByTitle) { //making list of film titles
            titleList.push(key);
        }

        return { 'filmTitles': titleList, 'showingsGrouped': groupedByTitle }; //ready list of titles and showings grouped by titles
    },
    calendarShowings(pickedDate) {
        const parsedPickedDate = moment(pickedDate).format('YYYY-MM-DD');
        const showings = showingsService.list()[0];
        const result = [];

        for (const showingElem of showings) { //selecting showings from picked date and adding to array
            if (showingElem.date.includes(parsedPickedDate)) {
                let showcopy = JSON.parse(JSON.stringify(showingElem));
                showcopy.date = this.dateParser(showcopy.date);
                result.push(showcopy);
            }
        }
        showingsCtrl.list(result);
        seatsCtrl.toggleListener();
        return result;

    },
    goBackToTitles() {
        view.show(showingsCtrl.showList);
        view.show(showingsCtrl.filmTitles);
        view.hide(showingsCtrl.goBackToTitlesBtn());
        view.show(showingsCtrl.detailsDiv);
    },
    list(showings) {

        this.sortShowings(showings); //sorting showings
        showings = this.groupShowings(showings);
        console.log(showings);
        view.renderContent("entry-template-titles", JSON.parse(`{ "showings": ${JSON.stringify(showings.filmTitles)}}`), "film-titles");
        view.hide(showingsCtrl.backCalendarBtn());
        [...this.titlesList].forEach(title => {
            title.addEventListener('click', function() { //SECOND STEP
                view.show(showingsCtrl.backCalendarBtn());

                view.renderContent("entry-template-times", JSON.parse(`{ "showings": ${JSON.stringify(showings.showingsGrouped[title.textContent])}}`), "showlist"); //list of hours of selected showing
                view.renderContent("entry-template-film", JSON.parse(`${JSON.stringify(showings.showingsGrouped[title.textContent][0])}`), "film"); //description of the film 


                showingsCtrl.backCalendarBtn().addEventListener('click', function() {
                    view.show(calendarCtrl.calendarDiv);
                    view.hide(showingsCtrl.showingsWrapper);
                    view.hide(showingsCtrl.backCalendarBtn());
                });
                view.hide(calendarCtrl.calendarDiv);
                view.show(showingsCtrl.showingsWrapper); //this?

                for (const title2 of [...showingsCtrl.titlesList]) { //only one title marked as active at a time
                    if (title2.classList.contains('active') && title2 !== title) {
                        title2.classList.remove('active');
                    }
                }
                title.classList.add('active');

                [...showingsCtrl.showingsList].forEach(showing => {
                    showing.addEventListener('click', event => { //THIRD STEP
                        event.preventDefault();

                        for (const showing2 of [...showingsCtrl.showingsList]) { //only one time of showings selected at a time
                            if (showing2.querySelector('p').classList.contains('active') && showing2.querySelector('p') !== showing.querySelector('p')) {
                                showing2.querySelector('p').classList.remove('active');
                                showing2.querySelector('p').classList.add('normal');
                            }
                        }
                        showing.querySelector('p').classList.remove('normal');
                        showing.querySelector('p').classList.add('active');



                        view.showFlex(showingsCtrl.detailsDiv);
                        view.hide(showingsCtrl.showList);
                        view.hide(showingsCtrl.filmTitles);
                        showingsCtrl.detailsDiv.classList.add('activeshow');






                        showingsService.selectById(event.currentTarget.dataset.showingId);
                        let seatsTemp = event.currentTarget.dataset.seats;
                        event.currentTarget.dataset.seats = seatsTemp - 1;
                        view.renderContent("entry-template-seats", event.currentTarget.dataset, "seats");
                        event.currentTarget.dataset.seats = seatsTemp;
                        seatsCtrl.disableListener();
                        seatsCtrl.selectedSeats = [];
                        document.getElementById("order").innerHTML = "";
                        seatsCtrl.toggleListener();
                        orderCtrl.orderListener();
                        const nextBtn = document.getElementById("nextBtn");
                        view.hide(nextBtn);
                        showingsCtrl.goBackToTitlesBtn().addEventListener('click', showingsCtrl.goBackToTitles);

                    }, false);
                });
            });
        });

    }

}
socket.on('seatstakennow', (msg => {
    console.log(showingsService.getSelected().id, msg.showing);
    //seatsCtrl.disableListener();
}));
const seatsCtrl = {
    seats: document.getElementsByClassName('seat'),
    seatsDiv: document.querySelector('#seats'),
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
                    if (this.selectedSeats.length == 0) view.hide(nextBtn);
                }
            });
        })
    },
    resetSeats() {
        [...this.seats].forEach(seat => {
            seat.classList.remove('selected');
        });
        this.selectedSeats = [];
    },
    disableListener() {
        fetch(request(`${API_URL}seatstaken/${showingsService.getSelected().id}`, 'GET'))
            .then(res => res.json())
            .then(seatstaken => {
                for (const seat of seatstaken) {
                    document.getElementById(Number(seat)).disabled = true;
                    //set button to disabled
                }
                view.showFlex(this.seatsDiv);
            });
    }
}



const orderCtrl = {
    orderDiv: document.querySelector('#order'),
    orderForm: document.forms['order-form'],
    backSeatsBtn() { return document.querySelector('#backSeatsBtn'); },
    pricing() {
        const price = document.forms['order-form'].price.value === "normal" ? showingsService.getSelected().normal : showingsService.getSelected().discount;
        const priceTotal = price * seatsCtrl.selectedSeats.length;
        document.querySelector('#total-price').innerHTML = `Total price to pay: ${priceTotal}`;
        return priceTotal;
    },
    orderListener() {
        const nextBtn = document.getElementById("nextBtn");

        const seatsOnly = document.getElementById("seats-only");


        nextBtn.addEventListener('click', event => {
            const orderData = { showing: showingsService.getSelected(), seatsSelected: seatsCtrl.selectedSeats };
            if (moment(orderData.showing.date).isValid()) { orderData.showing.date = moment(orderData.showing.date).format('YYYY-MM-DD HH:mm'); }

            view.renderContent("entry-template-order", orderData, "order");
            orderCtrl.backSeatsBtn().addEventListener('click', e => {
                seatsCtrl.resetSeats();
                view.show(seatsOnly);
                view.show(seatsCtrl.seatsDiv);
                view.hide(orderCtrl.orderDiv);
                view.hide(orderCtrl.backSeatsBtn());
                view.hide(loginCtrl.customerInfo);
            });
            loginCtrl.getInfo().then(email => {
                if (email === undefined) view.hide(loginCtrl.customerInfo);
            });
            view.hide(nextBtn);
            view.hide(seatsOnly);
            view.show(orderCtrl.backSeatsBtn());
            view.show(orderCtrl.orderDiv);
            view.hide(document.querySelector('#backGeneral'));

            authServices.loadUserCredentials();
            view.show(loginCtrl.customerInfo);
            const orderForm = document.forms['order-form'];
            orderForm['price'].addEventListener('change', this.pricing);
            document.querySelector('#total-price').innerHTML = `Total price to pay: ${this.pricing()}`;
            orderForm.addEventListener('submit', ticketCtrl.order, false);
            document.querySelector('#backGeneral').addEventListener('click', function() {
                initApp();
            });
        });


    }
}


const ticketCtrl = {
    order(event) {
        const orderForm = this;
        event.preventDefault();
        loginCtrl.getInfo().then(email => {
            console.log(email);
            if (email === undefined) {
                view.hide(seatsCtrl.seatsDiv);
                view.hide(orderCtrl.orderDiv);

                view.renderContent("entry-template-login", {}, "login"); //only form
                view.renderContent("entry-template-register", {}, "register"); //only form
                view.show(loginCtrl.loginDiv);
                view.show(loginCtrl.registerDiv);
                registerCtrl.registerForm().addEventListener('submit', registerCtrl.signup, false);
                loginCtrl.loginForm().addEventListener('submit', loginCtrl.login, false);

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
                        socket.emit('ticketordered', ticket);
                        showingsCtrl.detailsDiv.classList.add('ordered');
                        orderForm.innerHTML = result.msg;
                        view.hide(seatsCtrl.seatsDiv);
                        view.hide(orderCtrl.backSeatsBtn());
                        view.show(orderCtrl.orderDiv);
                        view.show(document.querySelector('#backGeneral'));
                    }).catch(error => Promise.reject(new Error(error)));
            }
        });

    }

}

const registerCtrl = {
    registerForm() { return document.getElementById('register-form'); },
    signup(event) {
        event.preventDefault();
        const registerStatus = document.querySelector('#register-status');

        const user = {
            email: this.email.value,
            password: this.password.value,
            name: this.name.value,
            surename: this.surename.value,
            telephone: this.telephone.value
        };
        authServices.register(user)
            .then(res => {
                if (res.success) {
                    registerStatus.innerHTML = res.msg;
                    registerStatus.classList.add('success');
                    view.hide(this);
                } else {
                    registerStatus.innerHTML = res.msg;
                    registerStatus.classList.add('error');
                }
            });
    }
}


const loginCtrl = {
    loginDiv: document.querySelector('#login'),
    registerDiv: document.querySelector('#register'),
    customerInfoEmail() { return document.querySelector('#customer-info-email'); },
    customerInfo: document.querySelector('#customer-info'),
    loginForm() { return document.forms['login-form']; },
    getInfo() {
        const that = this;
        const logoutButton = document.querySelector('#logout');
        logoutButton.addEventListener('click', loginCtrl.logout, false);
        return fetch(request(`${API_URL}memberinfo`, 'GET'))
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    this.customerInfoEmail().innerHTML = result.msg;
                    view.hide(this.loginDiv);
                    view.hide(this.registerDiv);
                    //view.show(this.customerInfo);
                    view.show(orderCtrl.orderDiv);
                    console.log(result.msg);
                    return result.msg;
                } else {
                    // console.log("Error getInfo:");
                }
            });
    },
    login(event) {
        event.preventDefault();
        const loginStatus = document.querySelector('#login-status');
        const user = {
            email: this.email.value,
            password: this.password.value
        };
        authServices.login(user)
            .then(res => {
                if (res.success) {
                    loginStatus.classList.add('success');
                    loginStatus.innerHTML = res.msg;
                    loginCtrl.getInfo();
                    view.show(loginCtrl.customerInfo);

                } else {
                    loginStatus.classList.add('error');
                    loginStatus.innerHTML = res.msg;
                }
            });
    },
    destrySession() { authServies.logout(); },

    logout() { // this?
        authServices.logout();
        loginCtrl.customerInfoEmail().innerHTML = "";
        view.hide(loginCtrl.customerInfo);
        initApp();
    }

}