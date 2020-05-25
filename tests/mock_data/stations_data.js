const real = [
    {
        city: {
            name: 'Wrocław',
            commune: {
                name: 'Wrocław',
                district: 'Wrocław',
                province: 'DOLNOŚLĄSKIE',
            },
            city_id: 1064,
        },
        address: 'ul. Bartnicza',
        station_id: 114,
        name: 'Wrocław - Bartnicza',
        latitude: 51.115933,
        longitude: 17.141125,
    },
    {
        city: {
            name: 'Wrocław',
            commune: {
                name: 'Wrocław',
                district: 'Wrocław',
                province: 'DOLNOŚLĄSKIE',
            },
            city_id: 1064,
        },
        address: 'ul. Wyb. J.Conrada-Korzeniowskiego 18',
        station_id: 117,
        name: 'Wrocław - Korzeniowskiego',
        latitude: 51.129378,
        longitude: 17.02925,
    },
    {
        city: {
            name: 'Wrocław',
            commune: {
                name: 'Wrocław',
                district: 'Wrocław',
                province: 'DOLNOŚLĄSKIE',
            },
            city_id: 1064,
        },
        address: 'al. Wiśniowa/ul. Powst. Śląskich',
        station_id: 129,
        name: 'Wrocław - Wiśniowa',
        latitude: 51.086225,
        longitude: 17.012689,
    },
    {
        city: {
            name: 'Osieczów',
            commune: {
                name: 'Osiecznica',
                district: 'bolesławiecki',
                province: 'DOLNOŚLĄSKIE',
            },
            city_id: 648,
        },
        address: '',
        station_id: 74,
        name: 'Osieczów',
        latitude: 51.31763,
        longitude: 15.431719,
    },
];

const fake_station = {
    city: {
        name: 'Łódź',
        commune: {
            name: 'Łódź',
            district: 'Łódź',
            province: 'Łódzkie',
        },
        city_id: 123,
    },
    address: 'ul. Struga',
    station_id: 777,
    name: 'Łódź - Struga',
    latitude: 45.086225,
    longitude: 11.012689,
};

module.exports = {real, fake_station};
