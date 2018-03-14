const API_URL = 'https://cinemadb.000webhostapp.com/hehe/index.php/';
//const API_URL = 'https://api.myjson.com/bins/w7wup';
//const API_URL = 'http://localhost:8000';
//const API_URL = 'http://localhost:3000/showings';
const headers = new Headers({
    'Access-Control-Allow-Origin': '*'
});


export function request(url, method, data) {
    return new Request(url, {
        method: method,
        mode: 'cors',
        header: headers,
        body: data
    });
}