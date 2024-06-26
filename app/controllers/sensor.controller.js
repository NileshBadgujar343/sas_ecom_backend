// const {SENSOR1, SENSOR2, SENSOR3, SENSOR4, SENSOR5, SENSOR6, SENSOR7, SENSOR8, SENSOR9, SENSOR10, SENSOR11, SENSOR12, SENSOR13, SENSOR14, SENSOR15, SENSOR16, SENSOR17, SENSOR18, SENSOR19, SENSOR20, SENSOR21, SENSOR22, SENSOR23, SENSOR24, SENSOR25, SENSOR26, SENSOR27, SENSOR28} = require("../constants/sensorName");
const Sensor = require("../models/sensor.model.js");
const httpStatus = require("http-status");
const utils = require('../../utils');
const jwt = require('jsonwebtoken');
const {connection: sql} = require("../models/db");
const mqtt = require('mqtt');
const host = '89.47.165.123'
const port = '8883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
const connectUrl = `mqtt://${host}:${port}`;
const axios = require('axios').default;

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'sasautomation',
  password: 'sasautomation',
  reconnectPeriod: 1000,
})
/*const topic = ''
client.on('connect', () => {
  console.log('Connected')
  client.subscribe([topic], () => {
    console.log(`Subscribe to topic '${topic}'`)
  })
})*/
client.on('message', (topic, payload) => {
  //coming data here we will call processed data from here then update final copy
  /*if (topic == "purpleair_f7fe"){
    obj = JSON.parse(payload.toString().replace(/'/g, '"'))
    Promise.all([postTableData(obj), postObservationData(obj)])
    .then(function (results){
      console.log("Result 1:: ",results[0].data);
      console.log("Result 2:: ",results[1].data);
    })
    .catch(function(errors){
      errors[0] && console.log(errors[0]); 
      errors[1] && console.log(errors[1])
    })
    //postTableData(obj);
  
  }*/
  console.log('Received Message:', topic, payload.toString())
})
client.on('connect', () => {
  console.log("Connection established.")
  // client.subscribe(['purpleair_f7fe', 'iitb_sensor2/', 'iitb_sensor3',  'iitb_sensor5'], { qos: 0, retain: false }, (error) => {
  //   if (error) {
  //     console.error(error)
  //   }
  //   console.log("Subscribed to topic:: purpleair_f7fe")
  // })

})

const findSensor = async (sensor_id) => {
  let sensor_name = 'Unknown';
  let topic = 'Unknown';
  let slot = 0;
  let skip = true;

  try {
    const results = await new Promise((resolve, reject) => {
      sql.query("SELECT * FROM metadata", (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    for (const row of results) {
      if (row.sensor_id === sensor_id) {
        sensor_name = row.sensor_name;
        topic = row.topic;
        slot = row.id;
        skip = false;
        break;
      }
    }

    if (sensor_name === 'Unknown') {
      console.log('No matching sensor found.');
    }
    if (sensor_name === 'bc:ff:4d:57:23:b5') {
      console.log('############################### New Sensor Found ##################################################');
    }

    let obj = { skip, sensor_name, topic, slot };
    return obj;
  } catch (error) {
    console.log('Error retrieving sensor data:', error);
    return obj;
  }
};

const postData = async (req) => {

  const sensor_id = req.body["SensorId"];
  // let sensor_name = req.body["Geo"];
  const coordinates = [req.body.lat, req.body.lon];
  const pm2_5_aqi_b = req.body['pm2.5_aqi_b'];
  const pm2_5_aqi = req.body['pm2.5_aqi'];
  const pm1_0_cf_1_b = req.body["pm1_0_cf_1_b"];
  const pm1_0_cf_1 = req.body["pm1_0_cf_1"];
  const p_0_3_um_b = req.body["p_0_3_um_b"];
  const p_0_3_um = req.body["p_0_3_um"];
  const pm2_5_cf_1_b = req.body["pm2_5_cf_1_b"];
  const pm2_5_cf_1 = req.body["pm2_5_cf_1"];
  const p_0_5_um_b = req.body["p_0_5_um_b"];
  const p_0_5_um = req.body["p_0_5_um"];
  const pm10_0_cf_1_b = req.body["pm10_0_cf_1_b"];
  const pm10_0_cf_1 = req.body["pm10_0_cf_1"];
  const p_1_0_um_b = req.body["p_1_0_um_b"];
  const p_1_0_um = req.body["p_1_0_um"];
  const pm1_0_atm_b = req.body["pm1_0_atm_b"];
  const pm1_0_atm = req.body["pm1_0_atm"];
  const p_2_5_um_b = req.body["p_2_5_um_b"];
  const p_2_5_um = req.body["p_2_5_um"];
  const pm2_5_atm_b = req.body["pm2_5_atm_b"];
  const pm2_5_atm = req.body["pm2_5_atm"];
  const p_5_0_um_b = req.body["p_5_0_um_b"];
  const p_5_0_um = req.body["p_5_0_um"];
  const pm10_0_atm_b = req.body["pm10_0_atm_b"];
  const pm10_0_atm = req.body["pm10_0_atm"];
  const p_10_0_um_b = req.body["p_10_0_um_b"];
  const p_10_0_um = req.body["p_10_0_um"];
  const pm25_atm = +((pm2_5_atm + pm2_5_atm_b) / 2).toFixed(2);
  const pm10_atm = +((pm10_0_atm + pm10_0_atm_b) / 2).toFixed(2);
  const temp_f = +((req.body["current_temp_f"]-32) * 5 / 9).toFixed(2);
  const humidity = req.body["current_humidity"];
  const pressure = req.body["pressure"];
  
  // here add new predictable data to modify all stuff from here
  
  console.log("Sensor Id::", sensor_id);
  let {skip, sensor_name, topic, slot} = await findSensor(sensor_id);
  if (skip) return;

  const pm25_bam = await calibratedData([pm25_atm, humidity, temp_f]); // call here async/await function to get data from flask app.
  console.log("Calibrated Data::", pm25_bam);

  const [biomass_burning, dust, gasoline_vehicle, diesel_vehicle, coal_combustion, waste_burning, industries, secondary_aerosol] = await apportionData([(p_0_3_um + p_0_3_um_b)/2, (p_0_5_um + p_0_5_um_b)/2, (p_1_0_um + p_1_0_um_b)/2, (p_2_5_um + p_2_5_um_b)/2, pm25_atm]); // call here async/await function to get data from flask app.
  // console.log("Apportion Data Array::", biomass_burning, dust, gasoline_vehicle, diesel_vehicle, coal_combustion, waste_burning, industries, secondary_aerosol);

  console.log(sensor_name, " Triggered");
  const result = {sensor_name, topic, coordinates, sensor_id, pm25_atm, pm10_atm, temp_f, humidity, pressure, pm2_5_aqi_b, pm2_5_aqi, pm1_0_cf_1_b, pm1_0_cf_1, p_0_3_um_b, p_0_3_um, pm2_5_cf_1_b, pm2_5_cf_1, p_0_5_um_b, p_0_5_um, pm10_0_cf_1_b, pm10_0_cf_1, p_1_0_um_b, p_1_0_um, pm1_0_atm_b, pm1_0_atm, p_2_5_um_b, p_2_5_um, pm2_5_atm_b, pm2_5_atm, p_5_0_um_b, p_5_0_um, pm10_0_atm_b, pm10_0_atm, p_10_0_um_b, p_10_0_um, pm25_bam, biomass_burning, dust, gasoline_vehicle, diesel_vehicle, coal_combustion, waste_burning, industries, secondary_aerosol, slot}
  // console.log(result);
  Promise.all([postTableData(result), postObservationData(result)])
  .then(function (results){
    console.log("Record has been saved.");
    // console.log("Result 1:: ",results[0].data);
    // console.log("Result 2:: ",results[1].data);
  })
  .catch(function(errors){
   errors[0] &&  console.log(errors[0]);
   errors[1] && console.log(errors[1]);
  });
  //Publish Here with below function
  publishController(result);
  // compare sensorid then save MySQL
  //     sql.query("insert into iitb_sensor1(pm2_5_atm_a, pm2_5_atm_b, pm2_5_cf_1_a, pm2_5_cf_1_b, pm10_atm_a, pm10_atm_b, pm10_cf_1_a, pm10_cf_1_b, pm2_5_atm, pm10_atm, temp_f, humidity, pressure) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [pm25_atm_a, pm25_atm_b, pm25_cf_1_a, pm25_cf_1_b, pm10_atm_a, pm10_atm_b, pm10_cf_1_a, pm10_cf_1_b, pm25_atm, pm10_atm, temp_f, humidity, pressure], (err, res) => {
  //       if (err) {
  //         console.log("error: ", err);
  //         res.status(401).send({
  //           message: err.message || "Error occured while dumping."
  //     });
  //   }
  //  });
  //  console.log("Record has been saved.");

}

const calibratedData = async (params) => {
  try{
  const headers = {
    'Content-Type': 'application/json'
  }
    let response = await axios.post('http://127.0.0.1:5000/api', params,
    {
      headers: headers
    })
    return response.data;

  }
  catch(err){
    console.log("ERR::", err);
    return undefined;
  }
}

const sensorChange = async (params) => {
  try{
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNhcyIsImlhdCI6MTY2NDM0MzU0MX0.zGsrdmDWjc9pWUBgUSQdTBaeaLzcBGyZ6sZRPxW2Ryk'
    }
    let response = await axios.put('http://89.47.165.123:8080/api/things', params,
    {
      headers: headers
    })
    return response.data;

  }
  catch(err){
    console.log("ERR::", err);
    return undefined;
  }
}

const apportionData = async (params) => {
  try{
  const headers = {
    'Content-Type': 'application/json'
  }
    let response = await axios.post('http://127.0.0.1:5000/apportion', params,
    {
      headers: headers
    })
    return response.data;

  }
  catch(err){
    console.log("ERR::", err);
    return undefined;
  }
}

const publishController = (data) => client.publish(data.topic, JSON.stringify(data) , { qos: 0, retain: false }, (error) => error && console.error(error));
const postObservationData = ({sensor_name, topic, coordinates, pm25_atm, pm10_atm, temp_f, humidity, pressure, pm2_5_aqi_b, pm2_5_aqi, pm1_0_cf_1_b, pm1_0_cf_1, p_0_3_um_b, p_0_3_um, pm2_5_cf_1_b, pm2_5_cf_1, p_0_5_um_b, p_0_5_um, pm10_0_cf_1_b, pm10_0_cf_1, p_1_0_um_b, p_1_0_um, pm1_0_atm_b, pm1_0_atm, p_2_5_um_b, p_2_5_um, pm2_5_atm_b, pm2_5_atm, p_5_0_um_b, p_5_0_um, pm10_0_atm_b, pm10_0_atm, p_10_0_um_b, p_10_0_um, pm25_bam, biomass_burning, dust, gasoline_vehicle, diesel_vehicle, coal_combustion, waste_burning, industries, secondary_aerosol, slot}) => {
  const result = {
    "observations": [
     { "kind": "measurement",
       "type": "humidity",
       "unit": { "name": "relative",
                 "symbol": "%"
               },
       "value": humidity
     },
    { "kind": "measurement",
       "type": "temperature",
       "unit": { "name": "celcius",
                 "symbol": "°C"
               },
       "value": temp_f
      
     },
     { "kind": "measurement",
       "type": "pressure",
       "unit": { "name": "millibars",
                 "symbol": "mbar"
               },
       "value": pressure
      
     },
     { "kind": "measurement",
       "type": "pm25",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": pm25_atm
      
     },
     { "kind": "measurement",
       "type": "pm10",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": pm10_atm
      
     },
      { "kind": "measurement",
       "type": "pm2_5_aqi_b",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": pm2_5_aqi_b
      
     },
     { "kind": "measurement",
       "type": "pm2_5_aqi",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": pm2_5_aqi
      
     },
     { "kind": "measurement",
       "type": "pm1_0_cf_1_b",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": pm1_0_cf_1_b
      
     },
     { "kind": "measurement",
       "type": "pm1_0_cf_1",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": pm1_0_cf_1
      
     },
     { "kind": "measurement",
       "type": "p_0_3_um_b",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": p_0_3_um_b
      
     },
     { "kind": "measurement",
       "type": "p_0_3_um",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": p_0_3_um
      
     },
     { "kind": "measurement",
       "type": "pm2_5_cf_1_b",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": pm2_5_cf_1_b
      
     },
     { "kind": "measurement",
       "type": "pm2_5_cf_1",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": pm2_5_cf_1
      
     },
     { "kind": "measurement",
       "type": "p_0_5_um_b",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": p_0_5_um_b
      
     },
     { "kind": "measurement",
       "type": "p_0_5_um",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": p_0_5_um
      
     },
     { "kind": "measurement",
       "type": "pm10_0_cf_1_b",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": pm10_0_cf_1_b
      
     },
     { "kind": "measurement",
       "type": "pm10_0_cf_1",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": pm10_0_cf_1
      
     },
     { "kind": "measurement",
       "type": "p_1_0_um_b",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": p_1_0_um_b
      
     },
     { "kind": "measurement",
       "type": "p_1_0_um",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": p_1_0_um
      
     },
     { "kind": "measurement",
       "type": "pm1_0_atm_b",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": pm1_0_atm_b
      
     },
     { "kind": "measurement",
       "type": "pm1_0_atm",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": pm1_0_atm
      
     },
     { "kind": "measurement",
       "type": "p_2_5_um_b",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": p_2_5_um_b
      
     },
     { "kind": "measurement",
       "type": "p_2_5_um",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": p_2_5_um
      
     },
     { "kind": "measurement",
       "type": "pm2_5_atm_b",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": pm2_5_atm_b
      
     },
     { "kind": "measurement",
       "type": "pm2_5_atm",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": pm2_5_atm
      
     },
     { "kind": "measurement",
       "type": "p_5_0_um_b",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": p_5_0_um_b
      
     },
     { "kind": "measurement",
       "type": "p_5_0_um",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": p_5_0_um
      
     },
     { "kind": "measurement",
       "type": "pm10_0_atm_b",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": pm10_0_atm_b
      
     },
     { "kind": "measurement",
       "type": "pm10_0_atm",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": pm10_0_atm
      
     },
     { "kind": "measurement",
       "type": "p_10_0_um_b",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": p_10_0_um_b
      
     },
     { "kind": "measurement",
       "type": "p_10_0_um",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": p_10_0_um
      
     },
     { "kind": "measurement",
       "type": "pm25_bam",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": pm25_bam
      
     },
     { "kind": "measurement",
       "type": "biomass_burning",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": biomass_burning
     },
     { "kind": "measurement",
       "type": "dust",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": dust
     },
     { "kind": "measurement",
       "type": "gasoline_vehicle",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": gasoline_vehicle
     },
     { "kind": "measurement",
       "type": "diesel_vehicle",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": diesel_vehicle
     },
     { "kind": "measurement",
       "type": "coal_combustion",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": coal_combustion
     },
     { "kind": "measurement",
       "type": "waste_burning",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": waste_burning
     },
     { "kind": "measurement",
       "type": "industries",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": industries
     },
     { "kind": "measurement",
       "type": "secondary_aerosol",
       "unit": { "name": "µg/m3",
                 "symbol": "µg/m3"
               },
       "value": secondary_aerosol
     },
    ],
     "thing": {
       "name": sensor_name,
       slot,
       "geometry" : {
                    "type" : "Point",
                    coordinates
            },
      topic,
       "supportedObservationTypes" : {
                    "measurement" : [
                            "temperature",
                            "humidity",
                            "pressure",
                            "pm25",
                            "pm10",
                            "pm2_5_aqi_b",
                            "pm2_5_aqi",
                            "pm1_0_cf_1_b",
                            "pm1_0_cf_1",
                            "p_0_3_um_b",
                            "p_0_3_um",
                            "pm2_5_cf_1_b",
                            "pm2_5_cf_1",
                            "p_0_5_um_b",
                            "p_0_5_um",
                            "pm10_0_cf_1_b",
                            "pm10_0_cf_1",
                            "p_1_0_um_b",
                            "p_1_0_um",
                            "pm1_0_atm_b",
                            "pm1_0_atm",
                            "p_2_5_um_b",
                            "p_2_5_um",
                            "pm2_5_atm_b",
                            "pm2_5_atm",
                            "p_5_0_um_b",
                            "p_5_0_um",
                            "pm10_0_atm_b",
                            "pm10_0_atm",
                            "p_10_0_um_b",
                            "p_10_0_um",
                            "pm25_bam"
                    ],
                    "event" : [ ],
            }
     }
    }
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNhcyIsImlhdCI6MTY2NDM0MzU0MX0.zGsrdmDWjc9pWUBgUSQdTBaeaLzcBGyZ6sZRPxW2Ryk'
    }
      return axios.post('http://89.47.165.123:8080/api/observations', result,
      {
        headers: headers
      })
};
const postTableData = ({sensor_name, topic, coordinates, pm25_atm, pm10_atm, temp_f, humidity, pressure, pm2_5_aqi_b, pm2_5_aqi, pm1_0_cf_1_b, pm1_0_cf_1, p_0_3_um_b, p_0_3_um, pm2_5_cf_1_b, pm2_5_cf_1, p_0_5_um_b, p_0_5_um, pm10_0_cf_1_b, pm10_0_cf_1, p_1_0_um_b, p_1_0_um, pm1_0_atm_b, pm1_0_atm, p_2_5_um_b, p_2_5_um, pm2_5_atm_b, pm2_5_atm, p_5_0_um_b, p_5_0_um, pm10_0_atm_b, pm10_0_atm, p_10_0_um_b, p_10_0_um, pm25_bam, biomass_burning, dust, gasoline_vehicle, diesel_vehicle, coal_combustion, waste_burning, industries, secondary_aerosol, slot}) => {
  const result = { 
    "table": {
      "temperature": temp_f,
      "humidity": humidity,
      "pressure": pressure,
      "pm25": pm25_atm,
      "pm10": pm10_atm,
      "pm2_5_aqi_b": pm2_5_aqi_b,
      "pm2_5_aqi": pm2_5_aqi,
      "pm1_0_cf_1_b": pm1_0_cf_1_b,
      "pm1_0_cf_1": pm1_0_cf_1,
      "p_0_3_um_b": p_0_3_um_b,
      "p_0_3_um": p_0_3_um,
      "pm2_5_cf_1_b": pm2_5_cf_1_b,
      "pm2_5_cf_1": pm2_5_cf_1,
      "p_0_5_um_b": p_0_5_um_b,
      "p_0_5_um": p_0_5_um,
      "pm10_0_cf_1_b": pm10_0_cf_1_b,
      "pm10_0_cf_1": pm10_0_cf_1,
      "p_1_0_um_b": p_1_0_um_b,
      "p_1_0_um": p_1_0_um,
      "pm1_0_atm_b": pm1_0_atm_b,
      "pm1_0_atm": pm1_0_atm,
      "p_2_5_um_b": p_2_5_um_b,
      "p_2_5_um": p_2_5_um,
      "pm2_5_atm_b": pm2_5_atm_b,
      "pm2_5_atm": pm2_5_atm,
      "p_5_0_um_b": p_5_0_um_b,
      "p_5_0_um": p_5_0_um,
      "pm10_0_atm_b": pm10_0_atm_b,
      "pm10_0_atm": pm10_0_atm,
      "p_10_0_um_b": p_10_0_um_b,
      "p_10_0_um": p_10_0_um,
      "pm25_bam": pm25_bam,
      "biomass_burning": biomass_burning,
      "dust": dust,
      "gasoline_vehicle": gasoline_vehicle, 
      "diesel_vehicle": diesel_vehicle, 
      "coal_combustion": coal_combustion, 
      "waste_burning": waste_burning, 
      "industries": industries, 
      "secondary_aerosol": secondary_aerosol
    },
  "thing": {
     "name": sensor_name,
     slot,
     "geometry" : {
                  "type" : "Point",
                  coordinates
          },
    topic,
     "supportedObservationTypes" : {
                  "measurement" : [
                          "temperature",
                          "humidity",
                          "pressure",
                          "pm25",
                          "pm10",
                          "pm2_5_aqi_b",
                          "pm2_5_aqi",
                          "pm1_0_cf_1_b",
                          "pm1_0_cf_1",
                          "p_0_3_um_b",
                          "p_0_3_um",
                          "pm2_5_cf_1_b",
                          "pm2_5_cf_1",
                          "p_0_5_um_b",
                          "p_0_5_um",
                          "pm10_0_cf_1_b",
                          "pm10_0_cf_1",
                          "p_1_0_um_b",
                          "p_1_0_um",
                          "pm1_0_atm_b",
                          "pm1_0_atm",
                          "p_2_5_um_b",
                          "p_2_5_um",
                          "pm2_5_atm_b",
                          "pm2_5_atm",
                          "p_5_0_um_b",
                          "p_5_0_um",
                          "pm10_0_atm_b",
                          "pm10_0_atm",
                          "p_10_0_um_b",
                          "p_10_0_um",
                          "pm25_bam"
                  ],
                  "event" : [ ]
          }
     }
  };
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNhcyIsImlhdCI6MTY2NDM0MzU0MX0.zGsrdmDWjc9pWUBgUSQdTBaeaLzcBGyZ6sZRPxW2Ryk'
  }
    return axios.post('http://89.47.165.123:8080/api/table', result,
    {
      headers: headers
    })
};
// Create and Save a new Sensor
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const userData = {
    name: req.body.name,
    username: req.body.email,
    isAdmin: true
  };

  // generate token
  const token = utils.generateToken(userData);
  // Create a Sensor
  const user = new Sensor({
    email: req.body.email,
    name: req.body.name,
    token: token,
    password: req.body.password,
    active: false
  });
  // Save Sensor in the database
  Sensor.create(user, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Sensor."
      });
    else res.send(data);
  });
};

exports.signin = (req, res) => {
  const user = req.body.username;
  const pwd = req.body.password;
  
  // return 400 status if username/password is not exist
  if (!user || !pwd) {
    return res.status(400).json({
      error: true,
      message: "Username or Password required."
    });
  }
  const u = {user, pwd};
  
  // Save Sensor in the database
  Sensor.signin(u, (err, data) => {
    if (err){
      res.status(500).send({
        message:
          err.message || "Some error occurred while login."
      });
    }
    else{
      console.log(data); //res.send(data);
      if (user !== data.email || pwd !== data.password) {
        return res.status(401).json({
          error: true,
          message: "Username or Password is Wrong."
        });
      }
      if (!data.token) {
        return res.status(400).json({
          error: true,
          message: "Token is required."
        });
      }
      jwt.verify(data.token, process.env.JWT_SECRET, function (err, user) {
        if (err) return res.status(401).json({
          error: true,
          message: "Your License has been expired!"
        });
        
        });
        // Generate token here
        const userData = {
          username: user,
          name: data.name
        };
      
        // generate token
        const token = utils.generateFToken(userData);
        const userD = new Sensor({
          email: req.body.username,
          name: data.name,
          token: token
        });

        Sensor.tcheck(userD, (err, data) => {
          if (err)
            res.status(500).send({
              message:
                err.message || "Some error occurred while checking the user-token."
            });
          else
            console.log(data);
            
      });

        /*
        if (data.active) {
          return res.status(400).json({
            error: true,
            message: "Please logout from other device first!"
          });
        }
        sql.query("UPDATE users SET active = 1 WHERE email= ?",data.email , (err, res) => {
          if (err) {
            console.log("error: ", err);
            return res.status(500).json({
              error: true,
              message: "Some error occurred while login."
            });
          }
    
        });*/

        
        return res.json({ user: userD, token: data.token });
    } 
  });
};

exports.signout = (req, res) => {
  const email = req.body.email;
  
  sql.query("UPDATE users SET active = 0 WHERE email= ?",email , (err, res) => {
    if (err) {
      console.log("error: ", err);
      return res.status(500).json({
        error: true,
        message: "Some error occurred while logout."
      });
    }
    
  });
  return res.json({ email: email });
};
// Update sensor mac-id
exports.updateMac = (req, res) => {
  const {macId, slot} = req.body;
  sql.query(`UPDATE metadata SET sensor_id = '${macId}' WHERE id = ${slot}; `, (err, results) => {
    if (err) {
      console.log("error: ", err);
      return res.status(500)
    }
    return res.sendStatus(httpStatus.OK);
    // else res.status(200).send(results)
  })  
};

// Update sensor name
exports.updateName = async (req, res) => {
  const {newname, slot} = req.body;
  await sensorChange({slot, newName: newname});
  sql.query(`UPDATE metadata SET sensor_name = '${newname}' WHERE id = ${slot}; `, (err, results) => {
    if (err) {
      console.log("error: ", err);
      return res.status(500)
    }
    console.log(results);
    return res.sendStatus(httpStatus.OK);
    // else res.status(200).send(results)
  })  
};

exports.verify = (req, res) => {
  const token = req.body.token || req.query.token; //this is F Token from user
  const username = req.body.user.email || req.query.user.email;
  const u = {token, username};
  Sensor.verifyFtoken(u, (err, data) => {
    if (err){
      console.log("error");
        res.status(401).send({
        message: err.message || "Token is required."
      });
    }
    else{ res.send(data); }
  });
};

// Retrieve all Sensors from the database.
exports.findAll = (req, res) => {
    Sensor.getAll(req.params.tableId, req.params.value, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving data."
        });
      else res.send(data);
    });
  };

// Retrieve all Sensors from the database.
exports.findTAll = (req, res) => {
  Sensor.getTAll(req.params.value, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving data."
      });
    else res.send(data);
  });
};

exports.categories = (req, res) => {
  Sensor.getCategories((err, data) => {
    if (err)
      res.status(500).json({
        message:
          err.message || "Some error occurred while retrieving data."
      });
    else res.send(data);
    // console.log("data ======",data);
  });
};

exports.products = (req, res) => {
  const categoryName = req.params.categoryName;

  // Fetch category ID by name
  Sensor.getCategoryId(categoryName, (err, categoryRows) => {
    if (err) {
      res.status(404).json({ error: 'Category not found' });
    }
    const categoryId = categoryRows[0].id;
    console.log(categoryId);

    Sensor.getProductsById(categoryId, (err, productRows) => {
      if (err)
      res.status(500).json({ error: 'Internal server error' });
      else res.json(productRows);
    });
  });

  
};

exports.store = (req, res) => {
  accessKey = "habvuhybduifhbhjBinng"
  const key = req.headers['accesskey'];
  if(key != accessKey){
    res.status(401).send({
      message: "Invalid AccessKey."
  });
}
  else{
    postData(req);
  }
};

// Retrieve all Sensors from the database.
exports.findCPAll = (req, res) => {
  Sensor.getCPAll(req.params.tableId, req.params.value, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving data."
      });
    else res.send(data);
  });
};

exports.retrieveSensor =(req, res) =>{
  Sensor.getRetrieveSensor(req.params.value, (err, data) => {
    if(err)
    res.status(500).send({
      message:
      err.message|| "Some error occurred while retrieving data."
    });
    else res.send(data);
  })
};

// Retrieve all Sensors from the database.
exports.findAVAll = (req, res) => {
  Sensor.getAVAll(req.params.tableId, req.params.value, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving data."
      });
    else res.send(data);
  });
};

// Retrieve all Sensors data weekly from the database.
exports.findWeeklyAll = (req, res) => {
  Sensor.getWeeklyAll(req.params.tableId, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving weekly data."
      });
    else res.send(data);
  });
};

// Retrieve all Sensors data weekly from the database.
exports.findMonthlyAll = (req, res) => {
  Sensor.getMonthlyAll(req.params.tableId, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving monthly data."
      });
    else res.send(data);
  });
};

// Retrieve all Sensors for bar graph AQI from the database.
exports.findData = (req, res) => {
  Sensor.getData(req.params.tableId, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving bar data."
      });
    else res.send(data);
  });
};

exports.findIitbLine = (req, res) => {
  Sensor.getIitbLine((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving iitb line data."
      });
    else res.send(data);
  });
};

// Retrieve live value of PM25.
exports.findPm25 = (req, res) => {
  Sensor.getPm25(req.params.tableId, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving pm25 Live data."
      });
    else res.send(data);
  });
};



/*
// Retrieve all Registered Users from the database.
exports.findAll = (req, res) => {
  Sensor.getAll(req.params.userId, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving data."
      });
    else res.send(data);
  });
};*/

// Find a single Sensor with a sensorId
exports.findOne = (req, res) => {
    Sensor.findById(req.params.sensorId, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Sensor with id ${req.params.sensorId}.`
          });
        } else {
          res.status(500).send({
            message: "Error retrieving Sensor with id " + req.params.sensorId
          });
        }
      } else res.send(data);
    });
  };

// Update a Sensor identified by the sensorId in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  Sensor.updateById(
    req.params.sensorId,
    new Sensor(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Sensor with id ${req.params.sensorId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating Sensor with id " + req.params.sensorId
          });
        }
      } else res.send(data);
    }
  );
};

// Delete a Sensor with the specified sensorId in the request
exports.delete = (req, res) => {
  Sensor.remove(req.params.sensorId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Sensor with id ${req.params.sensorId}.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete Sensor with id " + req.params.sensorId
        });
      }
    } else res.send({ message: `Sensor was deleted successfully!` });
  });
};

// Delete all Sensors from the database.
exports.deleteAll = (req, res) => {
  Sensor.removeAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all sensors."
      });
    else res.send({ message: `All Sensors were deleted successfully!` });
  });
};
