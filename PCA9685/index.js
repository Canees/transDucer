const PWM = require("rpio-pwm");
const rpio = require("rpio");
rpio.init({ mapping: "gpio" });

rpio.open(20, rpio.OUTPUT, rpio.LOW);
rpio.open(21, rpio.OUTPUT, rpio.LOW);
// let pwmCh, stepNum = 500, refresh = 50, pinBoardCode = 23



// console.log("初始化 PWM 通道");
// PWM.set_log_level(PWM.logLevel.debug);

// const cycleTimeUs = (1000 / refresh) * 1000,
//     stepTimeUs = cycleTimeUs / stepNum,
//     steeringPWMCfg = {
//         cycle_time_us: cycleTimeUs,
//         step_time_us: stepTimeUs,
//         delay_hw: 1,
//     };

// pwmCh = PWM.create_dma_channel(PWM.host_is_model_pi4() ? 5 : 12, steeringPWMCfg);


// const pin = pwmCh.create_pwm(pinBoardCode);

// let pulseWidth = 20;
// let increment = 1;

// setInterval(() => {
//     pin.set_width(pulseWidth)
//     pulseWidth += increment;
//     if (pulseWidth >= 40) {
//         increment = -1;
//     } else if (pulseWidth <= 20) {
//         increment = 1;
//     }
// }, 50);

