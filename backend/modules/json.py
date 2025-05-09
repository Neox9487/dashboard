import orjson
from typing import Any, Optional, Union

class Json:
  @staticmethod
  def dumps(data: Any,
    option: Optional[int]=None
  ) -> str:
    if option != None: return orjson.dumps(data, option=option).decode('utf-8')
    return orjson.dumps(data).decode('utf-8')

  @staticmethod
  def loads(data: Union[bytes, bytearray, memoryview, str]) -> Any:
    return orjson.loads(data)

  @staticmethod
  def dump(
    file: str,
    data: Any,
    option: int = orjson.OPT_INDENT_2
  ) -> None:
    open(file, mode="wb").write(orjson.dumps(data, option=option))

  @staticmethod
  def load(file: str) -> Any:
    return orjson.loads(open(file, mode="rb").read().decode("utf-8"))