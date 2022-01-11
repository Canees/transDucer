const i2c = require('i2c-bus');
const i2c1 = i2c.openSync(1);

// x,y,z角度=Angle/32768*180
// const data1 = i2c1.readWordSync(0x50, 0x3d);
// const data2 = i2c1.readWordSync(0x50, 0x3e);
// const data3 = i2c1.readWordSync(0x50, 0x3f);

// // 时间
// const data4 = i2c1.readWordSync(0x50, 0x30);
// const data5 = i2c1.readWordSync(0x50, 0x31);
// const data6 = i2c1.readWordSync(0x50, 0x32);
// const data7 = i2c1.readWordSync(0x50, 0x33);

// 模块温度 =  */100 °c
//  const data8 = i2c1.readWordSync(0x50, 0x40);

// // 轴加速度xyz = Angle/32768*16
// const data9 = i2c1.readWordSync(0x50, 0x34);
// const data10 = i2c1.readWordSync(0x50, 0x35);
// const data11 = i2c1.readWordSync(0x50, 0x36);

// // 轴角速度xyz = Angle/32768*2000
// const data12 = i2c1.readWordSync(0x50, 0x37);
// const data13 = i2c1.readWordSync(0x50, 0x38);
// const data14 = i2c1.readWordSync(0x50, 0x39);

// // 高低气压pa
// const data15 = i2c1.readWordSync(0x50, 0x45);
// const data16 = i2c1.readWordSync(0x50, 0x46);

// // 高度低|高cm
// const data17 = i2c1.readWordSync(0x50, 0x47);
// const data18 = i2c1.readWordSync(0x50, 0x48);

// 高低经度 = %10000000/100000 lon
// const data19 = i2c1.readWordSync(0x50, 0x49);
// const data20 = i2c1.readWordSync(0x50, 0x4a);

// // 高低纬度 = %10000000/100000 lat
// const data21 = i2c1.readWordSync(0x50, 0x4b);
// const data22 = i2c1.readWordSync(0x50, 0x4c);

// // GPS高度
// const data23 = i2c1.readWordSync(0x50, 0x4d);

// // GPS航向角
// const data24 = i2c1.readWordSync(0x50, 0x4e);

// // GPS 地速低字
// const data25 = i2c1.readWordSync(0x50, 0x4f);

// // GPS 地速高字
// const data26 = i2c1.readWordSync(0x50, 0x50);


// const txt1 = `角度：x：${data1 / 32768 * 180},y：${data2 / 32768 * 180},z：${data3 / 32768 * 180}`

// const txt2 = `GPS高度：${data23 / 100}`

// const txt3 = `模块温度：${data8 / 100}`


// const a = (data19.toString() + data20.toString()) % 10000000
// const b = (data21.toString() + data22.toString()) % 10000000
// console.log(data19, data20);
// console.log(data21, data22);
// console.log(txt1);

const bf = Buffer.alloc(8)
i2c1.writeByteSync(0x50, 0x49, 2)
i2c1.i2cReadSync(0x50, bf.length, bf);
const a = bf.readUIntBE(0, 6).toString();//切分字节流
console.log(a);
console.log(bf);
const bd = Buffer.alloc(8)
i2c1.writeByteSync(0x50, 0x4a, 2)
i2c1.i2cReadSync(0x50, bd.length, bd);
const b = bd.readUIntBE(0, 6).toString();//切分字节流
console.log(b);
console.log(bd);
console.log(+a + +b);




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
