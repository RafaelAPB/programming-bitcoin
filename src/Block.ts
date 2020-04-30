import { writeBytesReverse, bufToStream } from "./util/BufferUtil";
import { hash256 } from "./util/Hash256";
import { bigFromBuf, bigFromBufLE } from "./util/BigIntUtil";
import { bitsToTarget } from "./util/BlockUtil";
import { Readable } from "stream";
import * as merkleUtil from "./util/MerkleUtil";

export class Block {
  public static genesisBlockBytes: Buffer = Buffer.from(
    "0100000000000000000000000000000000000000000000000000000000000000000000003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a29ab5f49ffff001d1dac2b7c",
    "hex"
  );

  public static genesisBlock: Block = Block.parse(
    bufToStream(Block.genesisBlockBytes)
  );

  public static testnetGenesisBlockBytes: Buffer = Buffer.from(
    "0100000000000000000000000000000000000000000000000000000000000000000000003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4adae5494dffff001d1aa4ae18",
    "hex"
  );

  public static testnetGensisBlock: Block = Block.parse(
    bufToStream(Block.testnetGenesisBlockBytes)
  );

  /**
   * Parses a block header. The previous block and merkle root are transmitted
   * in little-endian format and must be converted to big-endian. For example:
   *
   * ```
   * 02000020 - version, 4-byte LE
   * 8ec39428b17323fa0ddec8e887b4a7c53b8c0a0a220cfd000000000000000000 - previous block, 32-bytes, internal order (LE)
   * 5b0750fce0a889502d40508d39576821155e9c9e3f5c3157f961db38fd8b25be - merkle root, 32-bytes, internal order (LE)
   * 1e77a759 - timestamp, 4-byte LE
   * e93c0118 - bits, 4-byte LE
   * a4ffd71d - nonce, 4-byte LE
   * ```
   * @example
   * ```typescript
   * const buffer = Buffer.from("020000208ec39428b17323fa0ddec8e887b4a7\
   * c53b8c0a0a220cfd0000000000000000005b0750fce0a889502d40508d39576821155e9c9e3f5c\
   * 3157f961db38fd8b25be1e77a759e93c0118a4ffd71d"), "hex");
   * const block = await Block.parse(buffer);
   * ```
   * @param stream
   */
  public static parse(stream: Readable): Block {
    const version = bigFromBufLE(stream.read(4));
    const prevBlock = stream.read(32).reverse(); // convert to RPC byte order
    const merkleRoot = stream.read(32).reverse(); // convert to RPC byte order
    const timestamp = bigFromBufLE(stream.read(4));
    const bits = stream.read(4).reverse(); // convert LE to BE
    const nonce = stream.read(4).reverse(); // convert LE to BE
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
   * Bits encodes the proof-of-work necessary in this block and is represented in
   * big-endian. It contains two parts: exponent and coefficient. When in big-endian
   * byte 0 is the exponent, bytes 1-3 are the coefficient as a big-endian number.
   * It is a succint way to express a really large number and can represent either
   * a positive or negative number.
   */
  public bits: Buffer;

  /**
   * Nonce stands for number used only once. It is the number changed by miners when
   * looking for proof-of-work. It is represented here in big-endian.
   */
  public nonce: Buffer;

  /**
   * List of transaction hashes for the block that are provided in RPC hash
   * byte order (big-endian).
   */
  public txHashes: string[];

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
    this.txHashes = [];
  }

  /**
   * Serializes the block into a Buffer according to the following information
   *
   * version - 4 bytes LE
   * previous block - 32 bytes, internal order (LE)
   * merkle root - 32 bytes, internal order (LE)
   * timestamp - 4 bytes LE
   * bits - 4 bytes LE
   * nonce - 4 bytes LE
   */
  public serialize(): Buffer {
    const result = Buffer.alloc(4 + 32 + 32 + 4 + 4 + 4);
    let offset = 0;

    // version, 4 bytes LE
    result.writeUInt32LE(Number(this.version), offset);
    offset += 4;

    // previous block, 32 bytes, internal byte order
    writeBytesReverse(this.prevBlock, result, offset);
    offset += 32;

    // merkle root, 32 bytes, internal byte order
    writeBytesReverse(this.merkleRoot, result, offset);
    offset += 32;

    // timestamp, 4 bytes LE
    result.writeUInt32LE(Number(this.timestamp), offset);
    offset += 4;

    // bits, 4 bytes LE
    writeBytesReverse(this.bits, result, offset);
    offset += 4;

    // nonce, 4 bytes LE
    writeBytesReverse(this.nonce, result, offset);
    offset += 4;

    return result;
  }

  /**
   * Returns the `hash256` of the block header in RPC byte order. This value
   * will have leading zeros and looks like:
   * 0000000000000000007e9e4c586439b0cdbe13b1370bdd9435d76a644d047523
   *
   * Because this value can be directly converted into a hexidecimal number
   * that can be compared to the target, it is considered big-endian.
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

  /**
   * Calculates the proof-of-work requirements from the bits. Target is calculated
   * as:
   *
   * ```
   * target = coefficient * 256^(exponent-3)
   * ```
   *
   * The target looks like:
   * 0000000000000000013ce9000000000000000000000000000000000000000000
   *
   */
  public target(): bigint {
    return bitsToTarget(this.bits);
  }

  /**
   * Difficulty is a more readable version of the target and makes the targets more
   * easy to compare and comprehend. The genesis block had a difficulty of 1.
   *
   * It is calculated with the formula:
   *
   * ```
   * difficulty = 0xffff * 256 ^ (0x1d - 3) / target
   * ```
   */
  public difficulty(): bigint {
    const target = this.target();
    return (BigInt(0xffff) * 256n ** (BigInt(0x1d) - 3n)) / target;
  }

  /**
   * This method verifies the proof of work is valid by looking at the
   * hash256 of the block header (in LE) and ensuring it is lower than the
   * target.
   *
   * For example:
   * T: 0000000000000000013ce9000000000000000000000000000000000000000000
   * H: 0000000000000000007e9e4c586439b0cdbe13b1370bdd9435d76a644d047523
   *
   */
  public checkProofOfWork(): boolean {
    return bigFromBuf(this.hash()) < this.target();
  }

  /**
   * Validates the merkle root agains the txhashes. This has a wrinkle because
   * of ordering of the hashes and the merkle root. So we need to first reverse
   * the order of the supplied txids and then reverse the order of the
   * calculated merkle root before doing the comparison to the one in our block
   * header.
   */
  public validateMerkleRoot() {
    // convert all of the txhashes into internal byte order
    const hashes = this.txHashes.map(p => Buffer.from(p, "hex").reverse());

    // calculate the merkle root
    const root = merkleUtil.merkleRoot(hashes);

    // compare the RPC byte order merkle root with the RPC byte order of the
    // freshly calculated merkle root
    return this.merkleRoot.equals(root.reverse());
  }
}
