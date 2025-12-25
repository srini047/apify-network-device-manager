from typing import List
from pydantic import ValidationError
from src.models.device import Device


class DeviceLoader:
    """
    Loader for Device objects from input data
    """
    @staticmethod
    def from_input(devices_list: list) -> List[Device]:
        devices: List[Device] = []

        for idx, data in enumerate(devices_list, start=1):
            try:
                device = Device(**data)
                devices.append(device)
            except ValidationError as exc:
                raise ValueError(f"Device #{idx} validation failed:\n{exc}") from exc

        return devices
