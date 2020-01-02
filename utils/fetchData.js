const fetch = require( 'node-fetch' );

/*
* Method to makes a Rest/Api call to host endpoint
* @param url: string
*/
module.exports = fetchData = async (url) => {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        return {
          status: error.response.status,
          error: error.response.data.error,
        }
    }
}
