const SerialPort = require('serialport')
const { ipcRenderer } = require("electron");


let serial_port = document.getElementById('serial_port')
let serial_baud = document.getElementById('serial_baud')
let serial_data = document.getElementById('serial_data')
let serial_stop = document.getElementById('serial_stop')
let myserialport;
let ConnectionFlag = false;
let device_mode_reslut = document.getElementById('device_mode_result');

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
  const deviceModeData = JSON.parse(data)
  console.log(deviceModeData)
  switch (deviceModeData.SerialFunction) {
    case 11:
      if(deviceModeData.deviceMode==1){
        device_mode_reslut.innerHTML = "The Device is in ConfigMode";
      }
      if(deviceModeData.deviceMode==2) {
        device_mode_reslut.innerHTML = "The Device is in ModbusMode";
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
      stopBits: parseInt(stopBits)},
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

    myserialport.on('data', function (data) {
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
  myserialport.write(device_mode_value, function(err) {
    if (err) {
      device_mode_reslut.innerHTML =err.message
      return console.log('Error on write: ', err.message)
    }
    console.log("Set DeviceMode Success.")
    device_mode_reslut.innerHTML = "Set DeviceMode Success，Please reboot."
  })
})

const GetdeviceModeBtn = document.getElementById("GetdeviceModeBtn");
GetdeviceModeBtn.addEventListener("click",function(event){
  if(ConnectionFlag == false) {
    alert("Device not Connectted.")
    return
  }
  var sendvalue = '{"SerialFunction":11}'
  myserialport.write(sendvalue, function(err) {
    if (err) {
      device_mode_reslut.innerHTML =err.message
      return console.log('Error on write: ', err.message)
    }
    console.log("Get Device Mode Success.")
  })
})


// 增加行
const addSlaveBtn = document.getElementById("addSlaveBtn");
addSlaveBtn.addEventListener("click",function(event){
  var editTable = document.querySelector('tbody');
  var slave_address = document.getElementById("slave_address")
  var register_address = document.getElementById("register_address")
  var slave_function = document.getElementById("slave_function")
  var slave_protocol = document.getElementById("slave_protocol")

  if(slave_address.value === '' || register_address.value === ''|| slave_function.value === ''|| slave_protocol.value === '') {
    alert('请输入内容');
  }
  else {
    //创建节点
    var tr = document.createElement('tr');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    var td3 = document.createElement('td');
    var td4 = document.createElement('td');
    var td5 = document.createElement('td');
    //获取元素内容
    var checkbox=document.createElement("input");
    checkbox.type="checkbox";
    checkbox.name="checkRow";
    td1.appendChild(checkbox);
    td2.innerHTML = slave_address.value;
    td3.innerHTML = register_address.value;
    td4.innerHTML = slave_function.value;
    td5.innerHTML = slave_protocol.value;
    //添加内容到表格中
    tr.append(td1);
    tr.append(td2);
    tr.append(td3);
    tr.append(td4);
    tr.append(td5);
    editTable.append(tr);
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
  var sendvalue = {"SerialFunction":11, "msg":[]}
  var editTable = document.querySelector('tbody');
  var rows = editTable.rows
  for(var i=0; i<rows.length; i++){
    var cells = rows[i].cells;
    var protocol_code = 0
    switch (cells[4].childNodes[0].nodeValue) {
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
      'register_address': parseInt(cells[2].childNodes[0].nodeValue),
      "count":1,
      "function": cells[3].childNodes[0].nodeValue,
      'protocol': protocol_code,
    }
    sendvalue.msg.push(item)
  }
  console.log(sendvalue)
  var sendvaludStr = JSON.stringify(sendvalue)
  myserialport.write(sendvaludStr, function(err) {
    if (err) {
      device_mode_reslut.innerHTML =err.message
      return console.log('Error on write: ', err.message)
    }
    console.log("Set Device modbus Success.")
  })
})


function div_show(div_id) {
  document.getElementById(div_id).style.visibility="visible";
}
function div_hidden(div_id) {
  document.getElementById(div_id).style.visibility="hidden";
}

// 监听Menu事件，展示不同内容
ipcRenderer.on("send-message-to-renderer",(event,args)=>{
  console.log("渲染进程收到的数据:",args);
  if(args == '设备连接') {
    div_show('serialSetting')
    div_hidden('ModeSetting')
    div_hidden('ModbusSetting')
  }
  if(args == '设备模式配置') {
    div_hidden('serialSetting')
    div_show('ModeSetting')
    div_hidden('ModbusSetting')
  }
  if(args == 'Modbus配置') {
    div_hidden('serialSetting')
    div_hidden('ModeSetting')
    div_show('ModbusSetting')
  }
})