import { expect } from "chai";
import { MerkleTree } from "../src/MerkleTree";
import { hash256 } from "../src/util/Hash256";
import { combine } from "../src/util/BufferUtil";

const hexbuf = hex => Buffer.from(hex, "hex");

describe("MerkleTree", () => {
  describe(".fromHashes()", () => {
    it("1 hash", () => {
      const hashes = [
        "00".repeat(32),
      ].map(hexbuf); // prettier-ignore

      const result = MerkleTree.fromHashes(hashes);
      expect(result.rootHex).to.equal("00".repeat(32));
    });

    it("2 hashes", () => {
      const hashes = [
        "00".repeat(32),
        "11".repeat(32),
      ].map(hexbuf); // prettier-ignore

      const result = MerkleTree.fromHashes(hashes);

      expect(result.rootHex).to.equal(
        // hash256(combine(hashes[0], hashes[1])).reverse().toString("hex")
        "127e4900feebf53bb61ecc03d9a628da770e4f8ef65cfd6d40852cd9a553b3d5"
      );
    });

    it("16 hashes - book example", () => {
      const hashes = [
        "9745f7173ef14ee4155722d1cbf13304339fd00d900b759c6f9d58579b5765fb",
        "5573c8ede34936c29cdfdfe743f7f5fdfbd4f54ba0705259e62f39917065cb9b",
        "82a02ecbb6623b4274dfcab82b336dc017a27136e08521091e443e62582e8f05",
        "507ccae5ed9b340363a0e6d765af148be9cb1c8766ccc922f83e4ae681658308",
        "a7a4aec28e7162e1e9ef33dfa30f0bc0526e6cf4b11a576f6c5de58593898330",
        "bb6267664bd833fd9fc82582853ab144fece26b7a8a5bf328f8a059445b59add",
        "ea6d7ac1ee77fbacee58fc717b990c4fcccf1b19af43103c090f601677fd8836",
        "457743861de496c429912558a106b810b0507975a49773228aa788df40730d41",
        "7688029288efc9e9a0011c960a6ed9e5466581abf3e3a6c26ee317461add619a",
        "b1ae7f15836cb2286cdd4e2c37bf9bb7da0a2846d06867a429f654b2e7f383c9",
        "9b74f89fa3f93e71ff2c241f32945d877281a6a50a6bf94adac002980aafe5ab",
        "b3a92b5b255019bdaf754875633c2de9fec2ab03e6b8ce669d07cb5b18804638",
        "b5c0b915312b9bdaedd2b86aa2d0f8feffc73a2d37668fd9010179261e25e263",
        "c9d52c5cb1e557b92c84c52e7c4bfbce859408bedffc8a5560fd6e35e10b8800",
        "c555bc5fc3bc096df0a0c9532f07640bfb76bfe4fc1ace214b8b228a1297a4c2",
        "f9dbfafc3af3400954975da24eb325e326960a25b87fffe23eef3e7ed2fb610e",
      ].map(hexbuf);

      const result = MerkleTree.fromHashes(hashes);

      expect(result.rootHex).to.equal(
        "597c4bafe3832b17cbbabe56f878f4fc2ad0f6a402cee7fa851a9cb205f87ed1"
      );
    });
  });

  describe(".fromProof()", () => {
    it("1 hash", () => {
      const hashes = [
        "00".repeat(32),
      ].map(hexbuf); // prettier-ignore

      const result = MerkleTree.fromProof(1n, 0n, hashes);
      expect(result.rootHex).to.equal("00".repeat(32));
    });

    it("2 hash", () => {
      const hashes = [
        "00".repeat(32),
        "11".repeat(32),
      ].map(hexbuf); // prettier-ignore

      const result = MerkleTree.fromProof(2n, BigInt(0b101), hashes);

      expect(result.rootHex).to.equal(
        "127e4900feebf53bb61ecc03d9a628da770e4f8ef65cfd6d40852cd9a553b3d5"
      );
    });

    it("16 hash - book example", () => {
      //
      // const root = result.rootNode;
      // console.log(root.left.hash.toString("hex"));
      // console.log(root.right.left.left.hash.toString("hex"));
      // console.log(root.right.left.right.left.hash.toString("hex"));
      // console.log(root.right.left.right.right.hash.toString("hex"));
      // console.log(root.right.right.left.left.hash.toString("hex"));
      // console.log(root.right.right.left.right.hash.toString("hex"));
      // console.log(root.right.right.right.hash.toString("hex"));

      const hashes = [
        "6382df3f3a0b1323ff73f4da50dc5e318468734d6054111481921d845c020b93",
        "3b67006ccf7fe54b6cb3b2d7b9b03fb0b94185e12d086a42eb2f32d29d535918",
        "9b74f89fa3f93e71ff2c241f32945d877281a6a50a6bf94adac002980aafe5ab",
        "b3a92b5b255019bdaf754875633c2de9fec2ab03e6b8ce669d07cb5b18804638",
        "b5c0b915312b9bdaedd2b86aa2d0f8feffc73a2d37668fd9010179261e25e263",
        "c9d52c5cb1e557b92c84c52e7c4bfbce859408bedffc8a5560fd6e35e10b8800",
        "8636b7a3935a68e49dd19fc224a8318f4ee3c14791b3388f47f9dc3dee2247d1",
      ].map(hexbuf);

      const total = 16n;
      const flags = BigInt("0b0101101101101"); // reversed preorder dfs
      const result = MerkleTree.fromProof(total, flags, hashes);
      expect(result.rootHex).to.equal(
        "597c4bafe3832b17cbbabe56f878f4fc2ad0f6a402cee7fa851a9cb205f87ed1"
      );
    });
  });
});
