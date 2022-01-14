const SerialPort = require('serialport')
SerialPort.list().then(res => {
    console.log(res);
})
const Readline = require('@serialport/parser-readline')
const port = new SerialPort('/dev/ttyUSB2')

const parser = port.pipe(new Readline({ delimiter: '\r\n' }))
parser.on('data', (data) => {
    console.log(666, data);
})
port.write(Buffer.from('AT\r\n'))