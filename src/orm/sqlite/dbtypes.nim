import std/[options, times, strutils]

import ../types

## SQLite 数据类型: https://www.sqlite.org/datatype3.html

func dbType*(T: typedesc[SomeInteger]): string = "INTEGER"
  ## SQLite `INTEGER`

func dbType*(T: typedesc[SomeFloat]): string = "REAL"
  ## SQLite `REAL`

func dbType*(T: typedesc[bool]): string = "INTEGER"
  ## 使用 `INTEGER` 表示 bool: 1 is true, 0 is false

func dbType*(T: typedesc[string]): string = "TEXT"
  ## SQLite `TEXT`

func dbType*[C](_: typedesc[StringOfCap[C]]): string = "VARCHAR($#)" % $C
  ## SQLite `VARCHAR()`, VARCHAR() 等效于 TEXT

func dbType*[C](_: typedesc[PaddedStringOfCap[C]]): string = "CHAR($#)" % $C
  ## SQLite `CHAR()`, CHAR() 等效于 TEXT

func dbType*(T: typedesc[DateTime]): string = "DATETIME"
  ## SQLite `DATETIME`

func dbType*(T: typedesc[DbBlob]): string = "BLOB"
  ## SQLite `BLOB`

func dbType*[T](_: typedesc[Option[T]]): string = dbType(T)
  ## Option 的 SQL 类型与原类型相同
