//export const API_URL = 'https://cinemadb.000webhostapp.com/hehe/index.php/'; PHP server
export const API_URL='https://cinemanode.azurewebsites.net/';
//const API_URL = 'https://api.myjson.com/bins/w7wup';

const headers = new Headers({
            'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
});


export function request(url, method, dataset) {
return new Request(url, {
        method: method,
        headers: headers,
        mode : 'cors',
        body: JSON.stringify(dataset)
    });
}