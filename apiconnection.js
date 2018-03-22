//export const API_URL = 'https://cinemadb.000webhostapp.com/hehe/index.php/'; PHP server
export const API_URL='https://cinemanode.azurewebsites.net/';
//const API_URL = 'https://api.myjson.com/bins/w7wup';

const headers = new Headers({
});


export function request(url, method, dataset) {
return new Request(url, {
        method: method,
        headers: headers,
        mode: 'cors',
        body: JSON.stringify(dataset)
    });
}