//export const API_URL = 'https://cinemadb.000webhostapp.com/hehe/index.php/'; PHP server
//export const API_URL='https://cinemanode.azurewebsites.net/';
//export const API_URL='http://cinemanode-cinemanode.193b.starter-ca-central-1.openshiftapps.com/';
export const API_URL='https://https-cinemanode.193b.starter-ca-central-1.openshiftapps.com/';
//const API_URL = 'https://api.myjson.com/bins/w7wup';

const headers = new Headers({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
});


export function request(url, method, dataset,headerz) {
    return new Request(url, {
        method: method,
        headers: headers,
        mode: 'cors',
        body: JSON.stringify(dataset)
    });
}