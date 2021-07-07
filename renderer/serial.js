const SerialPort = require('serialport')
const { ipcRenderer } = require("electron");
const tableify = require('tableify')

let serial_port = document.getElementById('serial_port')
let serial_baud = document.getElementById('serial_baud')
let serial_data = document.getElementById('serial_data')
let serial_stop = document.getElementById('serial_stop')
let myserialport;
let ConnectionFlag = false;
let serial_output = document.getElementById('serial_output');

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

function ParseIncomeData(data)
{
  console.log(data)
  const ReceivedData = JSON.parse(data)
  console.log(ReceivedData)
  serial_output.innerHTML = JSON.stringify(ReceivedData);
  var msg = ReceivedData.msg
  switch (ReceivedData.SerialFunction) {
    case 11:  // 获取设备模式
      var device_mode = document.getElementById('device_mode')
      var opts=device_mode.getElementsByTagName("option");
      for(var i=0; i<opts.length; i++){
        if(opts[i].value == msg.deviceMode){
          opts[i].selected = true;
        }
      }
      break;

    case 12:  // 获取设备信息
      delete eval(msg).SerialFunction;
      tableHTML = tableify(msg);
      document.getElementById('device_detail').innerHTML = tableHTML
      break;

    case 14:  // 获取modbus
      console.log(msg)
      for (let index = 0; index < msg.length; index++) {
        const element = msg[index];
        var protocol_code
        switch (element.slave_protocol) {
          case 2:
            protocol_code = "MQTT";
            break;
          case 3:
            protocol_code = "TCP";
            break;
          case 4:
            protocol_code = "UDP";
            break;
          case 5:
            protocol_code = "HTTP";
            break;
          case 6:
            protocol_code = "ALI";
          default:
            protocol_code = 0;
            break;
        }
        add_colomn(
          element.slave_address,
          element.modbus_function,
          element.register_address,
          element.register_count,
          element.slave_function,
          element.data_deal,
          protocol_code
        )  
      }
      break;

    case 16: // 获取MQTT
      document.getElementById('mqtt_address').value = msg.address
      document.getElementById('mqtt_port').value = msg.port
      document.getElementById('mqtt_clientid').value = msg.clientid
      document.getElementById('mqtt_username').value = msg.username
      document.getElementById('mqtt_password').value = msg.password
      var mqtt_version = document.getElementById('mqtt_version')
      var opts=mqtt_version.getElementsByTagName("option");
      for(var i=0; i<opts.length; i++){
        if(opts[i].value == msg.version){
          opts[i].selected = true;
        }
      }
      break;

    case 18: // 获取传输协议
      var passProtocol = document.getElementById('passProtocol')
      var opts=passProtocol.getElementsByTagName("option");
      for(var i=0; i<opts.length; i++){
        if(opts[i].value == msg.passProtocol){
          opts[i].selected = true;
        }
      }
      break;

    case 20: // 获取串口配置
      var serialSeting_baud = document.getElementById('serialSeting_baud')
      serialSeting_baud.value = msg.serialSeting_baud
      var serialSeting_data = document.getElementById('serialSeting_data')
      var opts=serialSeting_data.getElementsByTagName("option");
      for(var i=0; i<opts.length; i++){
        if(opts[i].value == msg.serialSeting_data){
          opts[i].selected = true;
        }
      }
      var serialSeting_stop = document.getElementById('serialSeting_stop')
      var opts=serialSeting_stop.getElementsByTagName("option");
      for(var i=0; i<opts.length; i++){
        if(opts[i].value == msg.serialSeting_stop){
          opts[i].selected = true;
        }
      }
      var serialSeting_Parity = document.getElementById('serialSeting_Parity')
      var opts=serialSeting_Parity.getElementsByTagName("option");
      for(var i=0; i<opts.length; i++){
        if(opts[i].value == msg.serialSeting_Parity){
          opts[i].selected = true;
        }
      }
      break;
    case 22: // 获取tcp/udp
      document.getElementById('ip_address').value = msg.ip_address
      document.getElementById('ip_port').value = msg.ip_port
      var TCP_UDP = document.getElementById('TCP_UDP')
      var opts=TCP_UDP.getElementsByTagName("option");
      for(var i=0; i<opts.length; i++){
        if(opts[i].value == msg.tcpudp){
          opts[i].selected = true;
        }
      }
      case 24: // 获取ali
        document.getElementById('product_key').value = msg.product_key
        document.getElementById('product_secret').value = msg.product_secret
        document.getElementById('device_name').value = msg.device_name
        document.getElementById('device_secret').value = msg.device_secret
        var puback_mode = document.getElementById('puback_mode')
        var opts=puback_mode.getElementsByTagName("option");
        for(var i=0; i<opts.length; i++){
          if(opts[i].value == msg.puback_mode){
            opts[i].selected = true;
          }
        }
      break;
    default:
      break;
  }
 
}

const serialConnectBtn = document.getElementById("serialConnectBtn");
serialConnectBtn.addEventListener("click",function(event){
  let comNum = serial_port.options[serial_port.selectedIndex].value;
  let baudRate = serial_baud.options[serial_baud.selectedIndex].value;
  let dataBits = serial_data.options[serial_data.selectedIndex].value;
  let stopBits = serial_stop.options[serial_stop.selectedIndex].value;
  if(comNum=="" || baudRate=="" || dataBits=="" || stopBits==""){
    alert("Please choose the corrent serial info.")
    return
  }
  
  if(serialConnectBtn.innerHTML == "连接") {
    myserialport = new SerialPort(comNum, 
      {baudRate: parseInt(baudRate),
      dataBits: parseInt(dataBits),
      stopBits: parseInt(stopBits),
      parity: 'none'},
      function (err) {
      if (err) {
        alert(err.message)
        return console.log('Error: ', err.message)
      }
    })
    const Delimiter = require('@serialport/parser-delimiter')
    const parser = myserialport.pipe(new Delimiter({ delimiter: '\n' }))
    parser.on('data', function (data) {
      ParseIncomeData(data)
    })
    
    serialConnectBtn.innerHTML = "断开连接"
    ConnectionFlag = true;  
  }
  else {
    myserialport.close(function (err) {
      console.log('port closed', err);
      return
    });
    serialConnectBtn.innerHTML = "连接"
    ConnectionFlag = false;  
  }
})

const GetDeviceDetailBtn = document.getElementById('GetDeviceDetailBtn')
GetDeviceDetailBtn.addEventListener('click',function(){
  if(ConnectionFlag == false) {
    alert("Device not Connectted.")
    return
  }
  var send_data = {"SerialFunction":12}
  myserialport.write(JSON.stringify(send_data)+"+", function(err) {
    if (err) {
      serial_output.innerHTML =err.message
      return console.log('Error on write: ', err.message)
    }
    serial_output.innerHTML = "GetDeviceDetailBtn"
    console.log("GetDeviceDetailBtn")
  })
})

const SetdeviceModeBtn = document.getElementById("SetdeviceModeBtn");
SetdeviceModeBtn.addEventListener("click",function(event){
  if(ConnectionFlag == false) {
    alert("Device not Connectted.")
    return
  }
  let device_mode = document.getElementById('device_mode');
  let device_mode_value = device_mode.options[device_mode.selectedIndex].value;
  if(device_mode_value == ""){
    alert("请先选择工作模式")
    return
  }
  console.log(device_mode_value)
  var sendvalue;
  switch (device_mode_value) {
    case '1':
      sendvalue = "SetDeviceMode:configMode";
      break;
    case '2':
      sendvalue = "SetDeviceMode:modbusMode";
      break;
    case '3':
      sendvalue = "SetDeviceMode:passthroughMode";
      break;

    default:
      break;
  }
  
  myserialport.write(sendvalue+"+", function(err) {
    if (err) {
      serial_output.innerHTML =err.message
      return console.log('Error on write: ', err.message)
    }
    console.log("Set DeviceMode Success.")
    serial_output.innerHTML = "Set DeviceMode Success，Please reboot."
  })
  if(device_mode_value == 3){
    div_show("protocolType")
  }
})

const SetPassthroughBtn = document.getElementById('SetPassthroughBtn')
SetPassthroughBtn.addEventListener('click',function(){
  if(ConnectionFlag == false) {
    alert("Device not Connectted.")
    return
  }
  let passProtocol = document.getElementById('passProtocol');
  let passProtocol_value = passProtocol.options[passProtocol.selectedIndex].value;
  console.log(passProtocol_value)
  if(passProtocol_value == ''){
    alert('请选择透传协议')
    return
  }
  var passprotocol_data = {"SerialFunction":17, "msg":{"passProtocol":parseInt(passProtocol_value)}}
  
  myserialport.write(JSON.stringify(passprotocol_data)+"+", function(err) {
    if (err) {
      serial_output.innerHTML =err.message
      return console.log('Error on write: ', err.message)
    }
    serial_output.innerHTML = "Set Passthrough Protocol Success，Please reboot."
    console.log("Set Passthrough Protocol Success.")
  })
})

const GetPassthroughBtn = document.getElementById('GetPassthroughBtn')
GetPassthroughBtn.addEventListener('click',function(){
  if(ConnectionFlag == false) {
    alert("Device not Connectted.")
    return
  }
  var passprotocol_data = {"SerialFunction":18}
  myserialport.write(JSON.stringify(passprotocol_data)+"+", function(err) {
    if (err) {
      serial_output.innerHTML =err.message
      return console.log('Error on write: ', err.message)
    }
    serial_output.innerHTML = "Set Passthrough Protocol Success，Please reboot."
    console.log("Get Passthrough Protocol Success.")
  })
})

const GetdeviceModeBtn = document.getElementById("GetdeviceModeBtn");
GetdeviceModeBtn.addEventListener("click",function(event){
  if(ConnectionFlag == false) {
    alert("Device not Connectted.")
    return
  }
  var sendvalue = {"SerialFunction":11}
  myserialport.write(JSON.stringify(sendvalue)+"+", function(err) {
    if (err) {
      serial_output.innerHTML =err.message
      return console.log('Error on write: ', err.message)
    }
    console.log("Get Device Mode Success.")
  })
})

function add_colomn(slave_address, modbus_function, register_address, register_count, slave_function, data_deal, slave_protocol ) {
  //创建节点
  var editTable = document.querySelector('tbody');
  var tr = document.createElement('tr');
  var td1 = document.createElement('td');
  var td2 = document.createElement('td');
  var td3 = document.createElement('td');
  var td4 = document.createElement('td');
  var td5 = document.createElement('td');
  var td6 = document.createElement('td');
  var td7 = document.createElement('td');
  var td8 = document.createElement('td');
  //获取元素内容
  var checkbox=document.createElement("input");
  checkbox.type="checkbox";
  checkbox.name="checkRow";
  td1.appendChild(checkbox);
  td2.innerHTML = slave_address;
  td3.innerHTML = modbus_function;
  td4.innerHTML = register_address;
  td5.innerHTML = register_count;
  td6.innerHTML = slave_function;
  td7.innerHTML = data_deal;
  td8.innerHTML = slave_protocol;
  //添加内容到表格中
  tr.append(td1);
  tr.append(td2);
  tr.append(td3);
  tr.append(td4);
  tr.append(td5);
  tr.append(td6);
  tr.append(td7);
  tr.append(td8);
  editTable.append(tr);
}

// 增加行
const addSlaveBtn = document.getElementById("addSlaveBtn");
addSlaveBtn.addEventListener("click",function(event){
  var slave_address = document.getElementById("slave_address")
  var modbus_function = document.getElementById("modbus_function")
  var register_address = document.getElementById("register_address")
  var register_count = document.getElementById("register_count")
  var slave_function = document.getElementById("slave_function")
  var data_deal = document.getElementById("data_deal")
  var slave_protocol = document.getElementById("slave_protocol")

  if(slave_address.value === '' || register_address.value === ''|| slave_function.value === ''|| slave_protocol.value === '') {
    alert('请输入内容');
  }
  else {
    add_colomn(
      slave_address.value,
      modbus_function.value,
      register_address.value,
      register_count.value,
      slave_function.value,
      data_deal.value,
      slave_protocol.value
    )
  }
})

//删除行
const deleteSlaveBtn = document.getElementById("deleteSlaveBtn");
deleteSlaveBtn.addEventListener("click",function(event){
  var editTable = document.querySelector('tbody');
  if(confirm("确认删除所选?")){
    var checkboxs=document.getElementsByName("checkRow");
    for(var i=0;i<checkboxs.length;i++){
        if(checkboxs[i].checked){
            var n=checkboxs[i].parentNode.parentNode;
            editTable.removeChild(n);
            i--;
        }
    }  
  }
})

//提交table
const commitSlaveBtn = document.getElementById("commitSlaveBtn");
commitSlaveBtn.addEventListener("click",function(event){
  if(ConnectionFlag == false) {
    alert("Device not Connectted.")
    return
  }
  var sendvalue = {"SerialFunction":13, "msg":[]}
  var editTable = document.querySelector('tbody');
  var rows = editTable.rows
  for(var i=0; i<rows.length; i++){
    var cells = rows[i].cells;
    var protocol_code = 0
    switch (cells[7].childNodes[0].nodeValue) {
      case "MQTT":
        protocol_code = 2;
        break;
      case "TCP":
        protocol_code = 3;
        break;
      case "UDP":
        protocol_code = 4;
        break;
      case "HTTP":
        protocol_code = 5;
        break;
      case "ALI":
        protocol_code = 6;
      default:
        protocol_code = 0;
        break;
    }
    
    var item = {
      'slave_address': parseInt(cells[1].childNodes[0].nodeValue),
      'modbus_function': parseInt(cells[2].childNodes[0].nodeValue),
      'register_address': parseInt(cells[3].childNodes[0].nodeValue),
      'register_count': parseInt(cells[4].childNodes[0].nodeValue),
      'slave_function': cells[5].childNodes[0].nodeValue,
      "data_deal": cells[6].childNodes[0].nodeValue,
      'slave_protocol': protocol_code,
    }
    sendvalue.msg.push(item)
  }
  console.log(sendvalue)
  var sendvaludStr = JSON.stringify(sendvalue)
  myserialport.write(sendvaludStr+"+", function(err) {
    if (err) {
      serial_output.innerHTML =err.message
      return console.log('Error on write: ', err.message)
    }
    console.log("Set Device modbus Success.")
  })
})

//获取table
const getSlaveBtn = document.getElementById("getSlaveBtn");
getSlaveBtn.addEventListener("click",function(event){
  if(ConnectionFlag == false) {
    alert("Device not Connectted.")
    return
  }
  var sendvalue= {"SerialFunction":14}
  var sendvaludStr = JSON.stringify(sendvalue)
  myserialport.write(sendvaludStr+"+", function(err) {
    if (err) {
      serial_output.innerHTML =err.message
      return console.log('Error on write: ', err.message)
    }
    console.log("Get Device modbus Success.")
  })
})

// 串口设置
const SetSerialBtn = document.getElementById('SetSerialBtn')
SetSerialBtn.addEventListener('click',function(){
  if(ConnectionFlag == false) {
    alert("Device not Connectted.")
    return
  }
  let serialSeting_baud = document.getElementById('serialSeting_baud');
  let serialSeting_baud_value = serialSeting_baud.value;
  let serialSeting_data = document.getElementById('serialSeting_data');
  let serialSeting_data_value = serialSeting_data.options[serialSeting_data.selectedIndex].value;
  let serialSeting_stop = document.getElementById('serialSeting_stop');
  let serialSeting_stop_value = serialSeting_stop.options[serialSeting_stop.selectedIndex].value;
  let serialSeting_Parity = document.getElementById('serialSeting_Parity');
  let serialSeting_Parity_value = serialSeting_Parity.options[serialSeting_Parity.selectedIndex].value;
  
  if(serialSeting_baud_value == '' || serialSeting_data_value == '' || serialSeting_stop_value == 'serialSeting_stop_value' || serialSeting_Parity_value == ''){
    alert('请填写信息')
    return
  }
  var serialSetting_data = {"SerialFunction":19, "msg": {
    "serialSeting_baud":parseInt(serialSeting_baud_value), 
    "serialSeting_data":parseInt(serialSeting_data_value),
    "serialSeting_stop":parseInt(serialSeting_stop_value),
    "serialSeting_Parity":parseInt(serialSeting_Parity_value)}}
  
  myserialport.write(JSON.stringify(serialSetting_data)+"+", function(err) {
    if (err) {
      serial_output.innerHTML =err.message
      return console.log('Error on write: ', err.message)
    }
    serial_output.innerHTML = "Set serialSetting Success，Please reboot."
    console.log("Set serialSetting Success.")
  })
})

const GetSerialBtn = document.getElementById('GetSerialBtn')
GetSerialBtn.addEventListener('click',function(){
  if(ConnectionFlag == false) {
    alert("Device not Connectted.")
    return
  }
  var sendvalue = '{"SerialFunction":20}'
  myserialport.write(sendvalue+"+", function(err) {
    if (err) {
      serial_output.innerHTML =err.message
      return console.log('Error on write: ', err.message)
    }
    serial_output.innerHTML = "Set serial Success."
    console.log("Get serial Success.")
  })
})

// MQTT设置
const SetMqttBtn = document.getElementById('SetMqttBtn')
SetMqttBtn.addEventListener('click',function(){
  if(ConnectionFlag == false) {
    alert("Device not Connectted.")
    return
  }
  let mqtt_address_value = document.getElementById('mqtt_address').value;
  let mqtt_port_value = document.getElementById('mqtt_port').value;
  let mqtt_clientid_value = document.getElementById('mqtt_clientid').value;
  let mqtt_username_value = document.getElementById('mqtt_username').value;
  let mqtt_password_value = document.getElementById('mqtt_password').value;
  let mqtt_version = document.getElementById('mqtt_version');
  let mqtt_version_value = mqtt_version.options[mqtt_version.selectedIndex].value;
  
  if(mqtt_address_value == '' || mqtt_port_value == '' || mqtt_clientid_value == ''  ||mqtt_version_value == '' ){
    alert('请填写信息')
    return
  }
  
  var mqttserting = {
    'clientid': mqtt_clientid_value,
    'username': mqtt_username_value,
    'address': mqtt_address_value,
    'password': mqtt_password_value,
    'port': parseInt(mqtt_port_value),
    'version': parseInt(mqtt_version_value)
  }
  var mqttConfigJson = {'SerialFunction':15, 'msg': mqttserting}

  myserialport.write(JSON.stringify(mqttConfigJson)+"+", function(err) {
    if (err) {
      serial_output.innerHTML =err.message
      return console.log('Error on write: ', err.message)
    }
    serial_output.innerHTML = "Set mqtt Success，Please reboot."
    console.log("Set mqtt Success.")
  })
})

const GetMqttBtn = document.getElementById('GetMqttBtn')
GetMqttBtn.addEventListener('click',function(){
  if(ConnectionFlag == false) {
    alert("Device not Connectted.")
    return
  }
  var mqttConfigJson = {'SerialFunction':16}
  myserialport.write(JSON.stringify(mqttConfigJson)+"+", function(err) {
    if (err) {
      serial_output.innerHTML =err.message
      return console.log('Error on write: ', err.message)
    }
    serial_output.innerHTML = "Get mqtt Success."
    console.log("Get mqtt Success.")
  })
})

// TCP设置
const SetTcpBtn = document.getElementById('SetTcpBtn')
SetTcpBtn.addEventListener('click',function(){
  if(ConnectionFlag == false) {
    alert("Device not Connectted.")
    return
  }
  let ip_address_value = document.getElementById('ip_address').value;
  let ip_port_value = document.getElementById('ip_port').value;
  let tcpudp = document.getElementById('TCP_UDP');
  let tcpudp_value = tcpudp.options[tcpudp.selectedIndex].value;
  
  if(ip_address_value == '' || ip_port_value == ''  ||tcpudp_value == '' ){
    alert('请填写信息')
    return
  }
  
  var tcpseting = {
    'ip_address': ip_address_value,
    'ip_port': parseInt(ip_port_value),
    'tcpudp': parseInt(tcpudp_value)
  }
  var tcpsetingJson = {'SerialFunction':21, 'msg': tcpseting}

  myserialport.write(JSON.stringify(tcpsetingJson)+"+", function(err) {
    if (err) {
      serial_output.innerHTML =err.message
      return console.log('Error on write: ', err.message)
    }
    serial_output.innerHTML = "Set mqtt Success，Please reboot."
    console.log("Set mqtt Success.")
  })
})

const GetTcpBtn = document.getElementById('GetTcpBtn')
GetTcpBtn.addEventListener('click',function(){
  if(ConnectionFlag == false) {
    alert("Device not Connectted.")
    return
  }
  var ConfigJson = {'SerialFunction':22, "msg":{'tcpudp':1}}
  myserialport.write(JSON.stringify(ConfigJson)+"+", function(err) {
    if (err) {
      serial_output.innerHTML =err.message
      return console.log('Error on write: ', err.message)
    }
    serial_output.innerHTML = "Get tcp Success."
    console.log("Get tcp Success.")
  })
})

// Ali设置
const SetAliBtn = document.getElementById('SetAliBtn')
SetAliBtn.addEventListener('click',function(){
  if(ConnectionFlag == false) {
    alert("Device not Connectted.")
    return
  }
  let product_key = document.getElementById('product_key').value;
  let product_secret = document.getElementById('product_secret').value;
  let device_name = document.getElementById('device_name').value;
  let device_secret = document.getElementById('device_secret').value;
  let puback_mode = document.getElementById('puback_mode');
  let puback_mode_value = puback_mode.options[puback_mode.selectedIndex].value;
  
  if(product_key == '' || product_secret == ''  ||device_name == '' || device_secret=='' || puback_mode_value==''){
    alert('请填写信息')
    return
  }
  
  var aliseting = {
    'product_key': product_key,
    'product_secret': product_secret,
    'device_name': device_name,
    'device_secret': device_secret,
    'puback_mode': parseInt(puback_mode_value),
  }
  var alisetingJson = {'SerialFunction':23, 'msg': aliseting}

  myserialport.write(JSON.stringify(alisetingJson)+"+", function(err) {
    if (err) {
      serial_output.innerHTML =err.message
      return console.log('Error on write: ', err.message)
    }
    serial_output.innerHTML = "Set ali Success，Please reboot."
    console.log("Set ali Success.")
  })
})

const GetAliBtn = document.getElementById('GetAliBtn')
GetAliBtn.addEventListener('click',function(){
  if(ConnectionFlag == false) {
    alert("Device not Connectted.")
    return
  }
  var ConfigJson = {'SerialFunction':24}
  myserialport.write(JSON.stringify(ConfigJson)+"+", function(err) {
    if (err) {
      serial_output.innerHTML =err.message
      return console.log('Error on write: ', err.message)
    }
    serial_output.innerHTML = "Get ali Success."
    console.log("Get ali Success.")
  })
})

const GetUdpBtn = document.getElementById('GetUdpBtn')
GetUdpBtn.addEventListener('click',function(){
  if(ConnectionFlag == false) {
    alert("Device not Connectted.")
    return
  }
  var ConfigJson = {'SerialFunction':22, "msg":{'tcpudp':2}}
  myserialport.write(JSON.stringify(ConfigJson)+"+", function(err) {
    if (err) {
      serial_output.innerHTML =err.message
      return console.log('Error on write: ', err.message)
    }
    serial_output.innerHTML = "Get ucp Success."
    console.log("Get ucp Success.")
  })
})

function div_show(div_id) {
  document.getElementById(div_id).style.visibility="visible";
}
function div_hidden(div_id) {
  document.getElementById(div_id).style.visibility="hidden";
}

// 监听Menu事件，展示不同内容
div_show('serialConnect')
ipcRenderer.on("send-message-to-renderer",(event,args)=>{
  console.log("渲染进程收到的数据:",args);
  if(args == '设备连接') {
    div_show('serialConnect')
    div_hidden('ModeSetting')
    div_hidden('ModbusSetting')
    div_hidden('protocolType')
    div_hidden('serialSetting')
    div_hidden('MqttSetting')
    div_hidden('TCPSetting')
    div_hidden('AliSetting')
  }
  if(args == '设备模式配置') {
    div_hidden('serialConnect')
    div_show('ModeSetting')
    div_hidden('ModbusSetting')
    div_hidden('serialSetting')
    div_hidden('MqttSetting')
    div_hidden('TCPSetting')
    div_hidden('AliSetting')
    let device_mode = document.getElementById('device_mode');
    let device_mode_value = device_mode.options[device_mode.selectedIndex].value;
    if(device_mode_value == 3){
      div_show("protocolType")
    }
  }
  if(args == 'Modbus配置') {
    div_hidden('serialConnect')
    div_hidden('ModeSetting')
    div_show('ModbusSetting')
    div_hidden('protocolType')
    div_hidden('serialSetting')
    div_hidden('MqttSetting')
    div_hidden('TCPSetting')
    div_hidden('AliSetting')
  }
  if(args == '串口配置'){
    div_hidden('serialConnect')
    div_hidden('ModeSetting')
    div_hidden('ModbusSetting')
    div_hidden('protocolType')
    div_hidden("MqttSetting")
    div_show("serialSetting")
    div_hidden('TCPSetting')
    div_hidden('AliSetting')
  }
  if(args == 'MQTT配置') {
    div_hidden('serialConnect')
    div_hidden('ModeSetting')
    div_hidden('ModbusSetting')
    div_hidden('protocolType')
    div_hidden('serialSetting')
    div_hidden('TCPSetting')
    div_hidden('AliSetting')
    div_show("MqttSetting")
  }
  if(args == 'TCP配置') {
    div_hidden('serialConnect')
    div_hidden('ModeSetting')
    div_hidden('ModbusSetting')
    div_hidden('protocolType')
    div_hidden('serialSetting')
    div_hidden("MqttSetting")
    div_hidden('AliSetting')
    div_show("TCPSetting")
  }
  if(args == 'Ali配置') {
    div_hidden('serialConnect')
    div_hidden('ModeSetting')
    div_hidden('ModbusSetting')
    div_hidden('protocolType')
    div_hidden('serialSetting')
    div_hidden("MqttSetting")
    div_hidden("TCPSetting")
    div_show('AliSetting')
  }
})