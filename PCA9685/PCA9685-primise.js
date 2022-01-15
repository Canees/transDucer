/** A library to use the PCA9685 PWM led/servo controller. This library
 * used the promisified version of i2c-bus: async-i2c-bus.
 */

import { BusInterface, Device, DeviceInterface } from "async-i2c-bus";

const DEFAULT_ADDRESS = 0x40;
// Commands
const MODE1 = 0x00;
const MODE2 = 0x01;
const SUBADR1 = 0x02;
const SUBADR2 = 0x03;
const SUBADR3 = 0x04;
const ALLCALLADDR = 0x05;
const LED0_ON_L = 0x06;
const LED0_ON_H = 0x07;
const LED0_OFF_L = 0x08;
const LED0_OFF_H = 0x09;
const ALL_LED_ON_L = 0xFA;
const ALL_LED_ON_H = 0xFB;
const ALL_LED_OFF_L = 0xFC;
const ALL_LED_OFF_H = 0xFD;
const PRESCALE = 0xFE;
const TEST_MODE = 0xFF; // Do not use - impredictable.

// MODE1 bits
const RESTART = 0x80;
const EXTCLK = 0x40;
const AI = 0x20;
const SLEEP = 0x10;
const SUB1 = 0x08;
const SUB2 = 0x04;
const SUB3 = 0x02;
const ALLCALL = 0x01;
// MODE2 bits
const INVRT = 0x10;
const OCH = 0x08;
const OUTDRV = 0x04;
const OUTNE_OFF = 0x00;
const OUTNE_ON = 0x01;
const OUTNE_HI = 0x10;

// Pre-scaling.
const OSCILLATOR = 25000000;
const RESOLUTION = 4096;

function delay(millis: number) {
    return new Promise((resolve) => setTimeout(resolve, millis));
}

/** Types of options */
export interface Options {
    /** I2C addres. default address is 0x40 */
    address?: number;
    /** make the device react to the ALLCALL address (false by default) */
    allcall?: boolean;
    /** the ALLCALL address. Undefined by default (preconfigured E0 at startup) */
    allcallAddress?: number;
    /** Global frequency of pulses. Default is set to 203 Hz (prescaler=30) */
    frequency?: number;
    /** external oscillator frequency in hz (hard to use on an Adafruit board) */
    oscillator?: number;
}

/** The device class used to control a PCA9685 board. */
export class PCA9685 {
    private device: DeviceInterface;
    private oscillator: number;
    private flags: number;
    private allcallAddress: number | undefined;
    private prescale: number = 0b11110; // default value

    /** Construct the device abstraction
     * @param bus: I2c bus
     * @param options: Optional option structure
     */
    constructor(
        bus: BusInterface,
        options: Options = {},
    ) {
        this.device = Device({ bus, address: options.address || DEFAULT_ADDRESS });
        this.oscillator = (options.oscillator || OSCILLATOR);
        this.allcallAddress = options.allcallAddress;
        this.prescale =
            options.frequency ? this.compute_prescale(options.frequency) : 30;
        this.flags =
            (options.allcall ? ALLCALL : 0)
            | (options.oscillator && options.oscillator > 0 ? EXTCLK : 0);
    }

    /** Initialize the device
     *
     * The bus must be opened. This step is necessary before using
     * any other function.
     * The library uses Auto Increment mode. It sets the flags defined
     * at startup.
     */
    public async init() {
        const mode1 = await this.sleep();
        await this.device.writeByte(
            MODE1,
            (mode1 & ~(RESTART | ALLCALL | EXTCLK)) | AI | this.flags);
        const mode2 = await this.device.readByte(MODE2);
        await this.device.writeByte(MODE2, mode2 | OUTDRV);
        await this.device.writeByte(PRESCALE, this.prescale);
        if (this.allcallAddress) {
            await this.device.writeByte(ALLCALLADDR, this.allcallAddress);
        }
        await this.restart();
    }

    /** Restarts (unconditionaly) the device if it was asleep.
     *
     * Should not be used for standard operation.
     * @ignore
     */
    public async restart(): Promise<boolean> {
        let mode1 = await this.device.readByte(MODE1);
        // Here we should not trigger restart.
        mode1 &= ~SLEEP & ~RESTART;
        await this.device.writeByte(MODE1, mode1);
        await delay(1); // 500us at least
        mode1 |= RESTART;
        await this.device.writeByte(MODE1, mode1);
        await delay(1);
        return true;
    }

    /** Put the device in sleep mode and  return MODE1 register
     *
     * Putting the device in sleep mode is often necessary to modify its
     * control registers. Should not be used for standard operation.
     * @ignore
     */
    public async sleep(): Promise<number> {
        let mode1 = await this.device.readByte(MODE1);
        mode1 = (mode1 & ~RESTART) | SLEEP;
        await this.device.writeByte(MODE1, mode1);
        await delay(1); // 500us (not strictly required)
        return mode1;
    }

    /** Sets the prescaler to achieve a given frequency in herz.
     *
     * @param freq the frequency to set
     * @return an empty promise.
     */
    public async set_frequency(freq: number) {
        this.prescale = this.compute_prescale(freq);
        await this.sleep();
        await this.device.writeByte(PRESCALE, this.prescale);
        await this.restart();
    }

    /** Sets the duty cycle of a single channel.
     *
     * @param chan the channel to configure
     * @param onValue the step where the pulse begins
     * @param offValue the step where the pulse ends
     * @return an empty promise.
     */
    public async set_pwm(chan: number, onValue: number, offValue: number) {
        chan &= 0xF;
        onValue &= 0x0FFF;
        offValue &= 0x0FFF;
        const buf = Buffer.alloc(4);
        buf.writeInt16LE(onValue, 0);
        buf.writeInt16LE(offValue, 2);
        await this.device.writeI2cBlock(LED0_ON_L + chan * 4, 4, buf);
    }

    /** Set the pulse length in micro second.
     *
     * @param chan the channel to configure
     * @param length the length of the pulse in microsecond
     * @param start an optional offset for the start of the pulse.
     * @return an empty promise.
     */
    public async set_pwm_ms(chan: number, length: number, start = 0) {
        const offset = length * this.oscillator / (1000000 * this.prescale);
        const end = (start + offset) % RESOLUTION;
        await this.set_pwm(chan, start, end);
    }

    /** Sets the duty cycle of all channels
     *
     * @param onValue the step where the pulse begins
     * @param offValue the step where the pulse ends
     * @return an empty promise.
     */
    public async set_all_pwm(onValue: number, offValue: number) {
        onValue &= 0x0FFF;
        offValue &= 0x0FFF;
        const buf = Buffer.alloc(4);
        buf.writeInt16LE(onValue, 0);
        buf.writeInt16LE(offValue, 2);
        await this.device.writeI2cBlock(ALL_LED_ON_L, 4, buf);
    }

    /** Shutdown a given channel
     *
     * @param chan channel to shut
     */
    public async shutdown(chan: number) {
        await this.device.writeByte(LED0_OFF_H + (chan * 4), 0x10);
    }

    /** Shutdown all channels */
    public async shutdown_all() {
        await this.device.writeByte(ALL_LED_OFF_H, 0x10);
    }

    private compute_prescale(freq: number) {
        const prescale = Math.round(this.oscillator / (RESOLUTION * freq)) - 1;
        if (prescale < 0x03 || prescale > 0xFF) {
            throw new Error("invalid frequency");
        }
        return prescale;
    }
}
