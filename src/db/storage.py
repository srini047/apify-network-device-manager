"""
MongoDB Storage Layer for Tech Support Data
"""

from typing import Dict
from pymongo import ASCENDING, DESCENDING
from apify import Actor

from src.db.model import TechSupportData
from src.db.connect import MongoDBClient


class TechSupportStorage:
    """Tech Support Data Storage handler"""
    
    COLLECTIONS_CONFIG = {
        'tech_support_data': [
            [('device_ip', ASCENDING), ('collected_at', DESCENDING)],
            [('collected_at', DESCENDING)],
            [('health.status', ASCENDING)],
            [('device_ip', ASCENDING)],
        ],
        'devices': [
            [('ip_address', ASCENDING)],
            [('last_seen', DESCENDING)],
            [('status', ASCENDING)],
        ],
        'collection_runs': [
            [('run_id', ASCENDING)],
            [('started_at', DESCENDING)],
        ]
    }
    
    def __init__(self, mongo_client: MongoDBClient):
        self.mongo_client = mongo_client
        self.tech_support_collection = None
        self.devices_collection = None
        self.runs_collection = None
    
    def initialize(self):
        """Initialize collections and indexes"""
        try:
            self.mongo_client.ensure_collections_and_indexes(self.COLLECTIONS_CONFIG)
            self.tech_support_collection = self.mongo_client.get_collection('tech_support_data')
            self.devices_collection = self.mongo_client.get_collection('devices')
            self.runs_collection = self.mongo_client.get_collection('collection_runs')
            Actor.log.info("✅ Tech support storage initialized")
        except Exception as e:
            Actor.log.error(f"Failed to initialize storage: {e}")
            raise
    
    def store_tech_support(self, data: TechSupportData) -> str:
        """Store tech support data"""
        try:
            doc = data.dict()
            result = self.tech_support_collection.insert_one(doc)
            doc_id = str(result.inserted_id)
            self._update_device_registry(data, doc_id)
            return doc_id
        except Exception as e:
            Actor.log.error(f"Failed to store tech support data: {e}")
            raise
    
    def _update_device_registry(self, data: TechSupportData, collection_id: str):
        """Update device registry"""
        try:
            self.devices_collection.update_one(
                {'ip_address': data.device_ip},
                {
                    '$set': {
                        'ip_address': data.device_ip,
                        'label': data.device_label,
                        'hostname': data.hostname,
                        'last_seen': data.collected_at,
                        'status': 'active',
                        'last_collection_id': collection_id,
                        'last_health_status': data.health.status
                    },
                    '$setOnInsert': {'first_seen': data.collected_at},
                    '$inc': {'total_collections': 1}
                },
                upsert=True
            )
        except Exception as e:
            Actor.log.warning(f"Failed to update device registry: {e}")
    
    def store_run_summary(self, run_summary: Dict):
        """Store run summary"""
        try:
            self.runs_collection.insert_one(run_summary)
            Actor.log.info(f"✅ Stored run summary: {run_summary.get('run_id')}")
        except Exception as e:
            Actor.log.error(f"Failed to store run summary: {e}")
