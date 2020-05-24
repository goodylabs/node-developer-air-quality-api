# air-quality-api

## Installation
Use npm to install dependencies.

```bash
npm install
```

## Usage
Start the app:
```bash
npm start
```
Launch tests:
```bash
npm test
```

# API documentation
### Get all the measuring stations.
**URL** : `/`
**Method** : `GET`
**Data example**

```json
[
    {
        "city": {
            "commune": {
                "communeName": "Wrocław",
                "districtName": "Wrocław",
                "provinceName": "DOLNOŚLĄSKIE"
            },
            "id": 1064,
            "name": "Wrocław"
        },
        "id": 114,
        "addressStreet": "ul. Bartnicza",
        "gegrLat": "51.115933",
        "gegrLon": "17.141125",
        "stationName": "Wrocław - Bartnicza"
    },
]
```

### Get all measurements for a station.
**URL** : `/stationId`
**Example URL:** `/109`
**Method** : `GET`
**Data example**
```json
{
    "stationId": 14,
    "measurements": [
        {
            "values": [
                {
                    "date": "2020-05-24T15:00:00.000Z",
                    "value": 13.5602
                },
                {
                    "date": "2020-05-24T14:00:00.000Z",
                    "value": 22.122
                }
            ],
            "key": "PM10"
        }
    ]
}
```

### Get average measurements from a station in a given day.
**URL** : `/stationId/avg`
**Example URL:** `/109/avg`
**Method** : `GET`
**Request body example**
```json
{
    "date":"2020-05-24T00:00:00.000+00:00"
}
```

**Data example**

```json
[
    {
        "key": "C6H6",
        "avg": 0.15629666666666664
    },
    {
        "key": "CO",
        "avg": 209.65373684210525
    },
    {
        "key": "NO2",
        "avg": 1.9887315789473683
    },
    {
        "key": "O3",
        "avg": 72.88123157894738
    },
    {
        "key": "PM10",
        "avg": 13.32400611111111
    },
    {
        "key": "SO2",
        "avg": 2.296262222222222
    }
]
```

### Get average measurements from a station in a given period.
**URL** : `/stationId/avg/period`
**Example URL:** `/109/avg/period`
**Method** : `GET`
**Request body example**
```json
{
	"start":"2020-05-24T00:00:00.000+00:00",
	"end":"2020-05-24T12:00:00.000+00:00"
}
```

**Data example**
```json
[
    {
        "key": "C6H6",
        "avg": 0.10761923076923076
    },
    {
        "key": "CO",
        "avg": 212.02338461538466
    },
    {
        "key": "NO2",
        "avg": 2.052965384615385
    },
    {
        "key": "O3",
        "avg": 70.72752307692309
    },
    {
        "key": "PM10",
        "avg": 13.469676153846153
    },
    {
        "key": "SO2",
        "avg": 2.3522253846153847
    }
]
```
