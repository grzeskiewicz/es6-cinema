//export const API_URL = 'https://cinemadb.000webhostapp.com/hehe/index.php/'; PHP server
export const API_URL='https://cinemanode.azurewebsites.net/';
//const API_URL = 'https://api.myjson.com/bins/w7wup';

const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/x-www-form-urlencoded'
});


export function request(url, method, dataset) {
return new Request(url, {
        method: method,
        header: headers,
        mode : 'cors',
        body: JSON.stringify(dataset)
    });
}