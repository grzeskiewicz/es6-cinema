import { authServices } from './services.js';
import { API_URL, request } from './apiconnection.js';
import { calendarDiv, renderWeek, renderCalendar, calendarObj, yearNow, selectedMonth, monthNow, createCalendar } from './calendar.js';
const IMAGE_URL = 'https://cinema-node-bucket.s3.amazonaws.com/';



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



//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<INIT >>>>>>>>>>>>>>>>>>>>>>>>>>>>>
fetch(request(API_URL + "showings", 'GET'))
    .then(res => res.json())
    .then(showings => {

        view.hide(showingsCtrl.showingsWrapper);
        showingsService.add(showings);

        calendarCtrl.initCalendar();

        authServices.loadUserCredentials();
        loginCtrl.getInfo();

        const customerInfo = document.querySelector('#customer-info');
        view.hide(customerInfo);
    });

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<INIT >>>>>>>>>>>>>>>>>>>>>>>>>>>>>




const view = {
    renderContent(source, context, output) {
        let sourceElem = document.getElementById(source).innerHTML;
        let template = Handlebars.compile(sourceElem);
        let html = template(context);
        document.getElementById(output).innerHTML = html;
    },
    show(element) {
        // element.classList.remove('visuallyhidden').add('visuallyvisible');
        element.style.display = ''
    },
    showFlex(element) {
        element.style.display = 'flex';
    },
    hide(element) {
        element.style.display = 'none';
        //element.classList.remove('visuallyvisible').add('visuallyhidden');
    },
    toggle(element) {
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }
}


let selectedMonthCopy = selectedMonth;
const calendarCtrl = {
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
                    } else {
                        view.hide(showingsCtrl.showingsWrapper);
                    }
                    day.classList.add('date-clicked')
                    for (const day2 of daysArray) {
                        if (day2.classList.contains('date-clicked') && day2 !== day) {
                            day2.classList.remove('date-clicked');
                        }
                    }

                    //  const weekTable = renderWeek(calendarObj, day.dataset.date);
                    //   calendarCtrl.initListeners(weekTable);

                });
            }
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
        let calendarTable = renderCalendar(calendarObj);
        this.initListeners(calendarTable);
        this.initListenersMonths();
        const roll = document.querySelector('#roll');
        roll.addEventListener('click', function() {
            const cal = document.querySelector('#calendar');
            cal.style.visibility = cal.style.visibility === 'collapse' ? 'visible' : 'collapse';
            // view.toggle(cal);
            this.innerHTML = this.innerHTML === '▲' ? 'Show calendar ▼' : '▲';
        });
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
    goBackToTitlesBtn: document.querySelector('#back-to-titles'),
    dateParser(stringdate) {
        const dateFormat = 'HH:mm';
        return moment(stringdate).format(dateFormat);
    },
    sortShowings(sList) {
        sList = sList.sort((a, b) => {
            return moment(a.date) - moment(b.date);
        });
    },
    groupShowings(sList) {
        const group = [];
        // const groupedShowingsArray = [];
        const titleList = [];

        for (const showing of sList) { //putting showings by the titles' names
            if (group[showing['title']] === undefined) group[showing['title']] = [];
            group[showing['title']].push(showing);
        }

        for (let key in group) { //making list of film titles
            titleList.push(key);
            //groupedShowingsArray.push(group[key]);
        }
        /*  const finallist = [];
          for (const elem of groupedShowingsArray) {
              for (const el of elem) {
                  finallist.push(el);
              }
          }*/
        console.log(titleList, group);
        return [titleList, group]; //ready list of titles and showings grouped by titles
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
        console.log(result);
        return result;

    },
    goBackToTitles() {
        view.showFlex(showingsCtrl.showList);
        view.showFlex(showingsCtrl.filmTitles);
        view.hide(goBackToTitlesBtn);
    },
    list(showings) {
        this.sortShowings(showings);
        const titles = this.groupShowings(showings);
        view.renderContent("entry-template-titles", JSON.parse(`{ "showings": ${JSON.stringify(titles[0])}}`), "film-titles");
        [...this.titlesList].forEach(title => {
            if (titles[1][title.textContent][0].imageurl.length === 0) {
                titles[1][title.textContent][0].imageurl = IMAGE_URL + titles[1][title.textContent][0].imageurl;
            } //setting poster's url
            title.addEventListener('click', function() { //SECOND STEP
                view.hide(showingsCtrl.detailsDiv);
                view.renderContent("entry-template-times", JSON.parse(`{ "showings": ${JSON.stringify(titles[1][title.textContent])}}`), "showlist"); //list of hours of selected showing
                view.renderContent("entry-template-film", JSON.parse(`${JSON.stringify(titles[1][title.textContent][0])}`), "film"); //description of the film 
                const cal = document.querySelector('#calendar');
                cal.style.visibility = 'collapse';
                document.querySelector('#roll').innerHTML = 'Show calendar ▼';

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
                        view.showFlex(showingsCtrl.goBackToTitlesBtn);
                        view.hide(showingsCtrl.showList);
                        view.hide(showingsCtrl.filmTitles);
                        showingsCtrl.detailsDiv.classList.add('activeshow');
                        goBackToTitlesBtn.addEventListener('click', goBackToTitles);

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
                    }, false);
                });
            });
        });

    }

}

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

                    if (this.selectedSeats.length == 0) { view.hide(nextBtn); }
                }
            });
        })
    },
    resetSeats() {
        [...this.seats].forEach(seat => {
            seat.classList.remove('selected');
        });
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
    pricing() {
        const price = document.forms['order-form'].price.value === "normal" ? showingsService.getSelected().normal : showingsService.getSelected().discount;
        const priceTotal = price * seatsCtrl.selectedSeats.length;
        return priceTotal;
    },
    orderListener() {
        const nextBtn = document.getElementById("nextBtn");
        const backBtn = document.getElementById("backBtn");
        const seatsOnly = document.getElementById("seats-only");
        view.hide(backBtn);
        console.log(backBtn);
        nextBtn.addEventListener('click', event => {
            view.hide(nextBtn);
            view.hide(seatsOnly);
            view.show(backBtn);
            const obj = { showing: showingsService.getSelected(), seatsSelected: seatsCtrl.selectedSeats };
            if (moment(obj.showing.date).isValid()) { obj.showing.date = moment(obj.showing.date).format('YYYY-MM-DD HH:mm'); }

            //obj.showing.date=moment(obj.showing.date);
            view.renderContent("entry-template-order", obj, "order"); //only valid usage of renderContent
            view.renderContent("entry-template-login", obj, "login"); //only form
            view.renderContent("entry-template-register", obj, "register"); //only form

            registerCtrl.registerForm().addEventListener('submit', registerCtrl.signup, false);
            loginCtrl.loginForm().addEventListener('submit', loginCtrl.login, false);

            const orderForm = document.forms['order-form'];
            document.querySelector('#total-price').innerHTML = `Total price to pay: ${this.pricing()}`;

            orderForm['price'].addEventListener('change', this.pricing);
            orderForm.addEventListener('submit', ticketCtrl.order, false);
        });

        backBtn.addEventListener('click', e => {
            seatsCtrl.resetSeats();
            view.show(seatsOnly);
            view.hide(backBtn);
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
                view.hide(seatsCtrl.seatsDiv);

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
                        //view.hide(orderForm);
                        showingsCtrl.detailsDiv.classList.add('ordered');
                        orderForm.innerHTML = result.msg;
                        view.hide(seatsCtrl.seatsDiv);
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
        console.log(this);
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
                    view.show(this.customerInfo);
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
        view.show(loginCtrl.loginDiv);
        view.show(loginCtrl.registerDiv);
        loginCtrl.loginDiv.querySelector('#login-form').reset();

        // loginCtrl.registerDiv.querySelector('#register-form').reset();
    }

}