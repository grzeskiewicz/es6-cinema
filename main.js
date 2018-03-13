import { authServices } from './services.js';


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
    this.selectedElem = this.elemArray[0].showings.find(element => element.id === Number(id));
    },
    list() { return this.elemArray; },
    first() { return this.elemArray[0] },
    remove() { this.elemArray = []; },
    getSelected(){ return this.selectedElem}
}
const showingsService = Object.create(listService);










// MAIN PART =======================================================================================================================================================




const API_URL='https://cinemadb.000webhostapp.com/hehe/index.php/';
//const API_URL = 'https://api.myjson.com/bins/w7wup';
//const API_URL = 'http://localhost:8000';
//const API_URL = 'http://localhost:3000/showings';
const headers = new Headers({
    'Access-Control-Allow-Origin': '*'
});


function request(url, method, data) {
    return new Request(url, {
        method: method,
        mode: 'cors',
        header: headers,
        body: data
    });
}

fetch(request(API_URL+'showings', 'GET'))
    .then(res => res.json())
    .then(showings => {
        let shows=JSON.stringify(showings);
        console.log(JSON.parse(shows));
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
    }
}

const showingsCtrl = {
    showingsList: document.getElementsByTagName("a"),
    list(showings) {
        view.renderContent("entry-template", showings, "showings");
        [...this.showingsList].forEach(showing => {
            showing.addEventListener('click', event => {

                event.preventDefault();
                view.renderContent("entry-template-seats", event.currentTarget.dataset, "seats");
                seatsCtrl.selectedSeats = [];
                document.getElementById("order").innerHTML="";
                seatsCtrl.toggleListener();
                orderCtrl.orderListener();
                console.log(event.currentTarget.dataset.showingId);
                showingsService.selectById(event.currentTarget.dataset.showingId);
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
                event.target.classList.toggle('selected');
                if (event.target.classList.contains('selected')) {
                    this.selectedSeats.push(event.target.firstChild.data);
                    //console.log(this.selectedSeats);
                } else {
                    let seatToRemoveIndex = this.selectedSeats.findIndex(element => element === event.target.firstChild.data);
                    this.selectedSeats.splice(seatToRemoveIndex, 1);
                    //console.log(this.selectedSeats);
                }
            });
        })
    }
}



const orderCtrl = {
    orderListener() {
        const orderBtn = document.getElementById("ordx");
        orderBtn.addEventListener('click', event => {
            console.log(seatsCtrl.selectedSeats);
            console.log(showingsService.getSelected());
            const obj={showing:showingsService.getSelected(), seatsSelected: seatsCtrl.selectedSeats};
            view.renderContent("entry-template-order",obj,"order");
            view.renderContent("entry-template-login",obj,"login");
            view.renderContent("entry-template-register",obj,"register");
            //const loginForm=document.forms['login-form'];
           // loginForm.addEventListener('submit',login,false);
            const registerForm=document.forms['register-form'];
            registerForm.addEventListener('submit',registerCtrl.signup,false);
        });
    }
}


const registerCtrl = {
   /* user: {
        email: '',
        password: '',
        name: '',
        surename: '',
        telephone: ''
    },*/
    signup(event) {
        event.preventDefault();
        //console.log(this.user);
        const registerForm=document.forms['register-form'];
        const user={
            email:registerForm.email.value,
            password:registerForm.password.value,
            name:registerForm.name.value,
            surename: registerForm.surename.value, 
            telephone:registerForm.telephone.value
        };
        console.log(user);
      
        

        /*authServies.register(this.user).then(msg => {
            //$state.go('login');
            console.log(`Registration msg ${msg}`);
        }, errMsg => {
            //fails
        });*/
    }
}


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