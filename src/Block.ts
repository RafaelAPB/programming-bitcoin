import { Readable } from "stream";
import { StreamReader } from "./util/StreamReader";
import { writeBytesReverse, writeBytes } from "./util/BufferUtil";
import { hash256 } from "./util/Hash256";

export class Block {
  /**
   * Parses a block header. The previous block and merkle root are transmitted
   * in little-endian format and must be converted to big-endian. For example:
   *
   * ```
   * 02000020 - version, 4-byte LE
   * 8ec39428b17323fa0ddec8e887b4a7c53b8c0a0a220cfd000000000000000000 - previous block, 32-bytes LE
   * 5b0750fce0a889502d40508d39576821155e9c9e3f5c3157f961db38fd8b25be - merkle root, 32-bytes LE
   * 1e77a759 - timestamp, 4-byte LE
   * e93c0118 - bits, 4-byte
   * a4ffd71d - nonce, 4-byte
   * ```
   * @example
   * ```typescript
   * const stream = bufToStream(Buffer.from("020000208ec39428b17323fa0ddec8e887b4a7\
   * c53b8c0a0a220cfd0000000000000000005b0750fce0a889502d40508d39576821155e9c9e3f5c\
   * 3157f961db38fd8b25be1e77a759e93c0118a4ffd71d"), "hex");
   * const block = await Block.parse(stream);
   * ```
   * @param stream
   */
  public static async parse(stream: Readable): Promise<Block> {
    const sr = new StreamReader(stream);
    const version = await sr.readUInt32LE();
    const prevBlock = (await sr.read(32)).reverse(); // convert LE to BE
    const merkleRoot = (await sr.read(32)).reverse(); // convert LE to BE
    const timestamp = await sr.readUInt32LE();
    const bits = await sr.read(4);
    const nonce = await sr.read(4);
    return new Block(version, prevBlock, merkleRoot, timestamp, bits, nonce);
  }

  /**
   * Version in big-endian
   *
   * Version is normally used for signaling which features are available. Bitcoin
   * blocks used sequential versions up through version 4. After this, BIP0009
   * was used to indicate that additional versioning bits could be used.
   */
  public version: bigint;

  /**
   * Previous block as 32-bytes in big-endian.
   */
  public prevBlock: Buffer;

  /**
   * Merkle root as 32-bytes in big-endian. This encodes all ordered transactions in
   * a 32-byte hash.
   */
  public merkleRoot: Buffer;

  /**
   * Unix style timestamp which is the number of seconds elapsed since January 1, 1970.
   * This value will eventually overflow in 2106.
   */
  public timestamp: bigint;

  /**
   * Bits encodes the proof-of-work necessary in this block.
   */
  public bits: Buffer;

  /**
   * Nonce stands for number used only once. It is the number changed by miners when
   * looking for proof-of-work.
   */
  public nonce: Buffer;

  /**
   * Represents a Block
   * @param version
   * @param prevBlock
   * @param merkleRoot
   * @param timestamp
   * @param bits
   * @param nonce
   */
  constructor(
    version: bigint,
    prevBlock: Buffer,
    merkleRoot: Buffer,
    timestamp: bigint,
    bits: Buffer,
    nonce: Buffer
  ) {
    this.version = version;
    this.prevBlock = prevBlock;
    this.merkleRoot = merkleRoot;
    this.timestamp = timestamp;
    this.bits = bits;
    this.nonce = nonce;
  }

  /**
   * Serializes the block into a Buffer according to the following information
   *
   * version - 4 bytes LE
   * previous block - 32 bytes LE
   * merkle root - 32 bytes LE
   * timestamp - 4 bytes LE
   * bits - 4 bytes
   * nonce - 4 bytes
   */
  public serialize(): Buffer {
    const result = Buffer.alloc(4 + 32 + 32 + 4 + 4 + 4);
    let offset = 0;

    // version, 4 bytes LE
    result.writeUInt32LE(Number(this.version), offset);
    offset += 4;

    // previous block, 32 bytes LE
    writeBytesReverse(this.prevBlock, result, offset);
    offset += 32;

    // merkle root, 32 bytes LE
    writeBytesReverse(this.merkleRoot, result, offset);
    offset += 32;

    // timestamp, 4 bytes LE
    result.writeUInt32LE(Number(this.timestamp), offset);
    offset += 4;

    // bits, 4 bytes
    writeBytes(this.bits, result, offset);
    offset += 4;

    // nonce, 4 bytes
    writeBytes(this.nonce, result, offset);
    offset += 4;

    return result;
  }

  /**
   * Returns the `hash256` of the block header in little-endian
   */
  public hash(): Buffer {
    return hash256(this.serialize()).reverse();
  }

  /**
   * Returns true if the block version supports BIP0009. Prior to this BIP,
   * an incremental approach to block version was used culminatting with vesrion 4
   * blocks supporting BIP00065 (OP_CHECKLOCKTIMEVERIFY).
   *
   * BIP0009 solves the problem of allowing multiple feature to be signaled on the
   * network at a time. There can be 29 different features signalled at the same time.
   *
   * The top 3-bits of the version are fixed to 001 which indicates that BIP0009 is
   * in use. This enables the range of bits for use [0x20000000...0x3FFFFFFF].
   *
   * The remaining 29 can signal readiness for a soft force. Once 95% of blocks signal
   * readiness in a given 2016 block epoch the feature is activated by the network.
   */
  public bip9() {
    return this.version >> 29n === 1n;
  }

  /**
   * Returns true if the version is signaling BIP91 which used bit 4.
   */
  public bip91() {
    return this.bip9() && ((this.version >> 4n) & 1n) === 1n;
  }

  /**
   * Returns true if the version is signaling BIP141 which used bit 1.
   */
  public bip141() {
    return this.bip9() && ((this.version >> 1n) & 1n) === 1n;
  }
}
