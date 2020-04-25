import { StreamReader } from "../util/StreamReader";
import { Readable } from "stream";
import { hash256 } from "../util/Hash256";
import { rstrip } from "../util/BufferUtil";

// tslint:disable-next-line: variable-name
export const NetworkMagic = Buffer.from("f9beb4d9", "hex");

// tslint:disable-next-line: variable-name
export const TestnetNetworkMagic = Buffer.from("00110907", "hex");

export class NetworkEnvelope {
  /**
   * Parses the network envelope according to the following formula:
   *
   * ```
   * network magic - 0xf9beb4d9 for mainnet
   * command - 12 bytes, human-readable
   * payload length - 4 bytes, little-endian
   * payload checksum - first 4-bytes of the hash256 of the payload
   * payload - data
   * ```
   * @param stream
   */
  public static async parse(stream: Readable, testnet: boolean = false) {
    const sr = new StreamReader(stream);
    const magic = await sr.read(4);

    // validate magic
    const expectedMagic = testnet ? TestnetNetworkMagic : NetworkMagic;
    if (!expectedMagic.equals(magic)) {
      throw new Error(
        `magic is not right ${magic.toString(
          "hex"
        )}, expected ${expectedMagic.toString("hex")}`
      );
    }

    // read the stripped command
    const command = rstrip(await sr.read(12), 0).toString();

    // process the payload
    const payloadLen = await sr.readUInt32LE();
    const payloadChecksum = await sr.read(4);
    const payload = await sr.read(Number(payloadLen));

    // verify the checksum
    const hash = hash256(payload).slice(4);
    if (!hash.equals(payloadChecksum)) {
      throw new Error("checksum does not match");
    }

    return new NetworkEnvelope(command, payload, testnet);
  }

  /**
   * Human readable command that is at most 12-bytes
   */
  public command: string;

  /**
   * Payload of information that is at most 2^32 though in practice is
   * limited to 32MB.
   */
  public payload: Buffer;

  /**
   * Indicates if on testnet
   */
  public testnet: boolean;

  constructor(command: string, payload: Buffer, testnet: boolean = false) {
    this.command = command;
    this.payload = payload;
    this.testnet = testnet;
  }

  /**
   * Prints the network command and payload in hex
   */
  public toString() {
    return `${this.command}: ${this.payload.toString("hex")}`;
  }
}
