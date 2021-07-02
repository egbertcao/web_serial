const SerialPort = require('serialport')

const serialConnectBtn = document.getElementById("serialConnectBtn");
serialConnectBtn.addEventListener("click",function(event){
  const port = new SerialPort('COM1',function (err) {
    if (err) {
      document.getElementById("serialConnectInfo").innerText = err.message
      return console.log('Error: ', err.message)
    }
  })
  port.write('main screen turn on', function(err) {
    if (err) {
      return console.log('Error on write: ', err.message)
    }
    console.log('message written')
  })

  // Switches the port into "flowing mode"
  port.on('data', function (data) {
    console.log('Data:', data)
    document.getElementById("serialConnectInfo").innerText = data
  })

  document.getElementById("serialConnectInfo").innerText = "helloworld";
})