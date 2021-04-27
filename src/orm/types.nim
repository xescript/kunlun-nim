import std/strutils

type
  StringOfCap*[C: static[int]] = distinct string
  PaddedStringOfCap*[C: static[int]] = distinct string

  DbValueKind* = int64 |float64 | string | DbBlob | DbNull

  DbNull* = object
  DbValue* = object
    case kind*: DbValueKind
    of dvkInt:
      i*: int64
    of dvkFloat:
      f*: float64
    of dvkString:
      s*: string
    of dvkBlob:
      b*: DbBlob
    of dvkNull:
      discard
