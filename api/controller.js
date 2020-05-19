const axios = require('axios').default;

export const getStations = async () => {
    let response = await axios.get('http://api.gios.gov.pl/pjp-api/rest/station/findAll');
    return response.data;
};


