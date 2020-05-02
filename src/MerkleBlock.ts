import { bigFromBufLE, bigFromBuf } from "./util/BigIntUtil";
import { Readable } from "stream";
import { decodeVarint } from "./util/Varint";
import { MerkleTree } from "./MerkleTree";

export class MerkleBlock {
  public static parse(stream: Readable): MerkleBlock {
    const version = bigFromBufLE(stream.read(4));
    const prevBlock = stream.read(32).reverse(); // convert from internal order
    const merkleRoot = stream.read(32).reverse(); // convert from internal order
    const timestamp = bigFromBufLE(stream.read(4));
    const bits = stream.read(4).reverse(); // convert LE to BE
    const nonce = stream.read(4).reverse(); // convert LE to BE
    const total = bigFromBufLE(stream.read(4)); // varint

    const numHashes = decodeVarint(stream);
    const hashes = [];
    for (let i = 0n; i < numHashes; i++) {
      hashes.push(stream.read(32).reverse()); // conert to RPC byte order
    }

    const flagsLen = decodeVarint(stream); // varint
    const flags = bigFromBufLE(stream.read(Number(flagsLen))); // flags

    return new MerkleBlock(
      version,
      prevBlock,
      merkleRoot,
      timestamp,
      bits,
      nonce,
      total,
      hashes,
      flags
    );
  }

  public version: bigint;
  public prevBlock: Buffer;
  public merkleroot: Buffer;
  public timestamp: bigint;
  public bits: Buffer;
  public nonce: Buffer;
  public total: bigint;
  public hashes: Buffer[];
  public flags: bigint;

  constructor(
    version: bigint,
    prevBlock: Buffer,
    merkleRoot: Buffer,
    timestamp: bigint,
    bits: Buffer,
    nonce: Buffer,
    total: bigint,
    hashes: Buffer[],
    flags: bigint
  ) {
    this.version = version;
    this.prevBlock = prevBlock;
    this.merkleroot = merkleRoot;
    this.timestamp = timestamp;
    this.bits = bits;
    this.nonce = nonce;
    this.total = total;
    this.hashes = hashes;
    this.flags = flags;
  }

  /**
   * Returns true if the reconsturction of the MerkleTree matches the provided
   * merkle root.
   */
  public isValid() {
    // first convert the hashes back to internal byte-order
    const hashes = this.hashes.map(h => Buffer.from(h).reverse());

    // reconstruct the tree
    const merkleTree = MerkleTree.fromProof(this.total, this.flags, hashes);

    // return if the tree matches the provided merkle root
    return this.merkleroot.equals(Buffer.from(merkleTree.hash).reverse());
  }
}
