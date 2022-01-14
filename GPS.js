const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const port = new SerialPort('/dev/ttyUSB0', {
    baudRate: 115200
})

const parser = port.pipe(new Readline({ delimiter: '\r\n' }))
parser.on('data', (data) => {
    console.log(data);
    // if (data.includes('$GNRMC')) {
    //     const gps = str_To_Gps84(data)
    //     const gdGPS = gps84_To_Gcj02(gps.lat, gps.lon)
    //     console.log(gdGPS);
    // }
})
/**
 * 北斗坐标系度分秒计算
 * @param msg
 * @return
 */
function str_To_Gps84 (msg) {
    let lat = 0;
    let lon = 0;
    let split = msg.split(",");
    if (split[4] == ("N") || split[4] == ("S")) {
        const i = split[3].indexOf(".");
        const latInt = split[3].substring(0, i - 2);
        const latDec = split[3].substring(i - 2);
        const i1 = split[5].indexOf(".");
        const lonInt = split[5].substring(0, i1 - 2);
        const lonDec = split[5].substring(i1 - 2);
        lat = (+latInt) + (latDec) / 60;
        lon = (+lonInt) + (lonDec) / 60;
    }

    return { lat, lon };
}
/** 高德采用GCJ编码 https://blog.csdn.net/weixin_45566249/article/details/118305913
 * 84 to 火星坐标系 (GCJ-02)
 * @param lat
 * @param lon
 */
function gps84_To_Gcj02 (lat, lon) {
    const pi = 3.1415926535897932384626;
    const a = 6378245.0;
    const ee = 0.00669342162296594323;

    let dLat = transformLat(lon - 105.0, lat - 35.0);
    let dLon = transformLon(lon - 105.0, lat - 35.0);
    const radLat = lat / 180.0 * pi;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
    dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
    const Lat = +lat + dLat;
    const Lon = +lon + dLon;
    return { Lat, Lon }
}

function transformLat (x, y) {
    const pi = 3.1415926535897932384626;
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y
        + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
    return ret;
}


function transformLon (x, y) {
    const pi = 3.1415926535897932384626;
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1
        * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0
        * pi)) * 2.0 / 3.0;
    return ret;
}
