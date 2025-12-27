from typing import Optional

from apify import Actor
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError


class MongoDBClient:
    """
    MongoDB Client to handle database connections
    """

    def __init__(
        self,
        mongodb_connection_string: str,
        database_name: str,
        connect_timeout_ms: int = 5000,
    ):
        self.mongodb_connection_string = mongodb_connection_string
        self.database_name = database_name
        self.connect_timeout_ms = connect_timeout_ms
        self._client: Optional[MongoClient] = None

    def connect(self) -> MongoClient:
        """
        Create and return MongoClient
        """
        try:
            self._client = MongoClient(
                self.mongodb_connection_string,
                serverSelectionTimeoutMS=self.connect_timeout_ms,
            )

            # Forces connection check
            self._client.admin.command("ping")

            return self._client

        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            raise RuntimeError(f"MongoDB connection failed: {e}")

    def get_database(self):
        """
        Return database handle
        """
        if not self._client:
            self.connect()

        if self._client is None:
            raise RuntimeError("Failed to establish MongoDB connection")

        return self._client[self.database_name]

    def get_collection(self, collection_name: str):
        """
        Return collection handle
        """
        db = self.get_database()
        return db[collection_name]

    def ensure_collections_and_indexes(self, collections_config: dict):
        """
        Ensure collections exist and create indexes
        
        Args:
            collections_config: Dict with collection names as keys and index specs as values
            Example:
            {
                'tech_support_data': [
                    [('device_ip', ASCENDING), ('collected_at', DESCENDING)],
                    [('collected_at', DESCENDING)],
                    [('health.status', ASCENDING)]
                ],
                'devices': [
                    [('ip_address', ASCENDING)],
                    [('last_seen', DESCENDING)]
                ]
            }
        """
        try:
            db = self.get_database()
            
            for collection_name, indexes in collections_config.items():
                collection = db[collection_name]
                
                # Collection is created automatically on first insert
                # But we can explicitly create indexes
                
                if indexes:
                    for index_spec in indexes:
                        try:
                            collection.create_index(index_spec)
                            Actor.log.info(f"✅ Created index on {collection_name}: {index_spec}")
                        except Exception as e:
                            # Index might already exist
                            Actor.log.debug(f"Index creation skipped for {collection_name}: {e}")
            
            Actor.log.info(f"✅ Collections and indexes ensured")
            
        except Exception as e:
            Actor.log.warning(f"Failed to ensure collections/indexes: {e}")

    def close(self):
        """
        Close MongoDB connection
        """
        if self._client:
            self._client.close()
            self._client = None
