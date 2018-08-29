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
                    const showings = showingsCtrl.calendarShowings(pickedDate);
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

                    const weekTable = renderWeek(calendarObj, day.dataset.date);
                    calendarCtrl.initListeners(weekTable);

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
            //cal.style.visibility=cal.style.visibility=== 'hidden' ? 'visible' : 'hidden';
            view.toggle(cal);
            this.innerHTML = this.innerHTML === '▼' ? '▲' : '▼';
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
        return result;

    },
    list(showings) {
        this.sortShowings(showings);
        const titles = this.groupShowings(showings);
        view.renderContent("entry-template-titles", JSON.parse(`{ "showings": ${JSON.stringify(titles[0])}}`), "film-titles");
        [...this.titlesList].forEach(title => {
            titles[1][title.textContent][0].imageurl = IMAGE_URL + titles[1][title.textContent][0].imageurl;
            title.addEventListener('click', function() {
                view.hide(showingsCtrl.detailsDiv);
                view.renderContent("entry-template-times", JSON.parse(`{ "showings": ${JSON.stringify(titles[1][title.textContent])}}`), "showlist"); //list of hours of selected showing
                view.renderContent("entry-template-film", JSON.parse(`${JSON.stringify(titles[1][title.textContent][0])}`), "film"); //description of the film 
                const cal = document.querySelector('#calendar');
                view.hide(cal);
                view.show(showingsCtrl.showingsWrapper); //this?

                for (const title2 of [...showingsCtrl.titlesList]) {
                    if (title2.classList.contains('active') && title2 !== title) {
                        title2.classList.remove('active');
                        // title2.classList.add('normal');
                    }
                }
                title.classList.add('active');
                [...showingsCtrl.showingsList].forEach(showing => {

                    //view.hide(showing.querySelector('.showing-details'));
                    //view.hide(showing.querySelector('.poster'));
                    showing.addEventListener('click', event => {
                        // console.log(this);
                        event.preventDefault();
                        for (const showing2 of [...showingsCtrl.showingsList]) {
                            // showing.querySelector('p')
                            if (showing2.querySelector('p').classList.contains('active') && showing2.querySelector('p') !== showing.querySelector('p')) {
                                showing2.querySelector('p').classList.remove('active');
                                showing2.querySelector('p').classList.add('normal');
                            }
                        }



                        /* detailsDiv.querySelector('#close').addEventListener('click', function() {
                             detailsDiv.classList.remove('activeshow');
                             showingsCtrl.showingsDiv().classList.remove('blur');
                             view.hide(detailsDiv);
                         });*/
                        view.showFlex(showingsCtrl.detailsDiv);
                        showingsCtrl.detailsDiv.classList.add('activeshow');
                        showing.querySelector('p').classList.remove('normal');
                        showing.querySelector('p').classList.add('active');

                        //const showingDetails = showing.querySelector('.showing-details');
                        //const poster = showing.querySelector('.poster');
                        //showingDetails.style.display = 'block';
                        //poster.style.display = 'block';
                        /*[...showingsCtrl.showingsList()].forEach(showingObj => {
                            if (showingObj.classList.contains('active') && showingObj !== showing) {
                                showingObj.classList.remove('active');
                            }
                            const showingObjDetails = showingObj.querySelector('.showing-details');
                            const showingObjPoster = showingObj.querySelector('.poster');
                            if (showingObjDetails.style.display === 'block' && showingObjDetails !== showingDetails) {
                                showingObjDetails.style.display = 'none';
                                showingObjPoster.style.display = 'none';
                            }

                        });*/
                        // showingsCtrl.showingsDiv().classList.add('blur');
                        showingsService.selectById(event.currentTarget.dataset.showingId);
                        // console.log(event.currentTarget.dataset);
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
        document.querySelector('#total-price').innerHTML = `Total price to pay: ${priceTotal}`;
    },
    orderListener() {
        const nextBtn = document.getElementById("nextBtn");
        nextBtn.addEventListener('click', event => {
            const obj = { showing: showingsService.getSelected(), seatsSelected: seatsCtrl.selectedSeats };
            if (moment(obj.showing.date).isValid()) { obj.showing.date = moment(obj.showing.date).format('YYYY-MM-DD HH:mm'); }

            //obj.showing.date=moment(obj.showing.date);
            view.renderContent("entry-template-order", obj, "order");
            view.renderContent("entry-template-login", obj, "login");
            view.renderContent("entry-template-register", obj, "register");
            console.log(registerCtrl.registerForm());
            registerCtrl.registerForm().addEventListener('submit', registerCtrl.signup, true);
            loginCtrl.loginForm().addEventListener('submit', loginCtrl.login, false);
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
                        // console.log(result);
                    }).catch(error => Promise.reject(new Error(error)));
            }
        });

    }

}

const registerCtrl = {
    registerForm() { return document.getElementById('register-form');},
    signup(event) {
        event.preventDefault();
        const registerStatus = document.querySelector('#register-status');
        let user = {
            email: this.registerForm().email.value,
            password: this.registerForm().password.value,
            name: this.registerForm().name.value,
            surename: this.registerForm().surename.value,
            telephone: this.registerForm().telephone.value
        };
        authServices.register(user)
            .then(res => {
                if (res.success) {
                    registerStatus.innerHTML = res.msg;
                    registerStatus.classList.add('success');
                    view.hide(this.registerForm());
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
    customerInfoEmail: document.querySelector('#customer-info-email'),
    customerInfo: document.querySelector('#customer-info'),
    loginForm() {return document.forms['login-form'];},
    getInfo() {
        const that = this;
        const logoutButton = document.querySelector('#logout');
        logoutButton.addEventListener('click', loginCtrl.logout, false);
        return fetch(request(`${API_URL}memberinfo`, 'GET'))
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    console.log(that, this);
                    this.customerInfoEmail.innerHTML = result.msg;
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
        let user = {
            email: this.loginForm().email.value,
            password: this.loginForm().password.value
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

    logout() {
        this.customerInfoEmail.innerHTML = "";
        view.hide(this.customerInfo);
        authServices.logout();
        view.show(this.loginDiv);
        view.show(this.registerDiv);
    }

}