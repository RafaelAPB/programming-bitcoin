import { hash256 } from "../util/Hash256";
import { hash160 } from "../util/Hash160";

export enum OpCode {
  // Constants
  OP_0 = 0, // 0x00
  OP_FALSE = 0, // 0x00
  OP_PUSHDATA1 = 76, // 0x4c
  OP_PUSHDATA2 = 77, // 0x4d
  OP_1 = 81, // 0x51
  OP_TRUE = 81, // 0x51
  OP_2 = 82, // 0x52
  OP_3 = 83, // 0x53
  OP_4 = 84, // 0x54
  OP_5 = 85, // 0x55
  OP_6 = 86, // 0x56
  OP_7 = 87, // 0x57
  OP_8 = 88, // 0x58
  OP_9 = 89, // 0x50
  OP_10 = 90, // 0x5a
  OP_11 = 91, // 0x5b
  OP_12 = 92, // 0x5c
  OP_13 = 93, // 0x5d
  OP_14 = 94, // 0x5e
  OP_15 = 95, // 0x5f
  OP_16 = 96, // 0x60

  // Flow Control
  OP_IF = 99, // 0x63
  OP_NOTIF = 100, // 0x64

  // Stack
  OP_TOALTSTACK = 107, // 0x6b
  OP_FROMALTSTACK = 108, // 0x6c
  OP_DUP = 118, // 0x76
  OP_SWAP = 124, // 0x7c

  // Bitwise
  OP_EQUAL = 135, // 0x87
  OP_EQUALVERIFY = 136, // 0x88

  // Arithmetic
  OP_1ADD = 0x8b,
  OP_1SUB = 0x8c,
  OP_2MUL = 0x8d, // disabled
  OP_2DIV = 0x8e, // disabled
  OP_NEGATE = 0x8f,
  OP_ABS = 0x90,
  OP_NOT = 0x91,
  OP_0NOTEQUAL = 0x92,
  OP_ADD = 0x93,
  OP_SUB = 0x94,
  OP_MUL = 0x95, // disabled
  OP_DIV = 0x96, // disabled
  OP_MOD = 0x97, // disabled
  OP_LSHIFT = 0x98, // disabled
  OP_RSHIFT = 0x99, // disabled
  OP_BOOLAND = 0x9a,
  OP_BOOLOR = 0x9b,
  OP_NUMEQUAL = 0x9c,
  OP_NUMEQUALVERIFY = 0x9d,
  OP_NUMNOTEQUAL = 0x9e,
  OP_LESSTHAN = 0x9f,
  OP_GREATERTHAN = 0xa0,
  OP_LESSTHANOREQUAL = 0xa1,
  OP_GREATERTHANOREQUAL = 0xa2,
  OP_MIN = 0xa3,
  OP_MAX = 0xa4,
  OP_WITHIN = 0xa5,

  // Crypto
  OP_HASH160 = 169, // 0xa9
  OP_HASH256 = 170, // 0xaa
  OP_CHECKSIG = 172, // 0xac
  OP_CHECKSIGVERIFY = 173, // 0xad
  OP_CHECKMULTISIG = 174, // 0xae
  OP_CHECKMULTISIGVERIFY = 175, // 0xaf
}