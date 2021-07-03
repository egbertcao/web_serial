const SerialPort = require('serialport')

let serial_port = document.getElementById('serial_port')
let serial_baud = document.getElementById('serial_baud')
let serial_data = document.getElementById('serial_data')
let serial_stop = document.getElementById('serial_stop')
let serial_Parity = document.getElementById('serial_Parity')
let serial_flow = document.getElementById('serial_flow')
let myserialport;

SerialPort.list().then((ports, err) => {
  if(err) {
    return
  } 
  console.log('ports', ports);
  if (ports.length === 0) {
    return
  }
  for (let item of ports) {
    serial_port.options.add(new Option(item.comName, item.comName));
  }
})

const serialConnectBtn = document.getElementById("serialConnectBtn");
serialConnectBtn.addEventListener("click",function(event){
  let comNum = serial_port.options[serial_port.selectedIndex].value;
  let baudRate = serial_baud.options[serial_baud.selectedIndex].value;
  let serialdata = serial_data.options[serial_data.selectedIndex].value;
  let serialstop = serial_stop.options[serial_stop.selectedIndex].value;
  let serialParity = serial_Parity.options[serial_Parity.selectedIndex].value;
  let serialflow = serial_flow.options[serial_flow.selectedIndex].value;
  if(serialConnectBtn.innerHTML == "连接") {
    myserialport = new SerialPort(comNum, 
      {baudRate: parseInt(baudRate),
      dataBits: parseInt(serialdata),
      stopBits: parseInt(serialstop)},
      function (err) {
      if (err) {
        alert(err.message)
        return console.log('Error: ', err.message)
      }
    })
    myserialport.write('hello world', function(err) {
      if (err) {
        return console.log('Error on write: ', err.message)
      }
      console.log('message written')
    })
  
    // Switches the port into "flowing mode"
    myserialport.on('data', function (data) {
      console.log('Data:', data)
      document.getElementById("ConnectResult").innerText = data
    })
    serialConnectBtn.innerHTML = "断开连接"  
  }
  else {
    myserialport.close(function (err) {
      console.log('port closed', err);
      serialConnectBtn.innerHTML = "连接"  
    });
  }
})
