import logging
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

logger = logging.getLogger("silvercare.database")

# Mock In-Memory Database for local development/testing without MongoDB daemon
class MockCursor:
    def __init__(self, data):
        self.data = data
        
    async def to_list(self, length=None):
        if length is not None:
            return self.data[:length]
        return self.data

class MockCollection:
    def __init__(self, name):
        self.name = name
        self.documents = []
        
    async def find_one(self, filter_dict):
        for doc in self.documents:
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc.copy()
        return None
        
    async def insert_one(self, document):
        doc_copy = document.copy()
        if "_id" not in doc_copy:
            doc_copy["_id"] = str(uuid.uuid4())
        self.documents.append(doc_copy)
        
        class InsertOneResult:
            inserted_id = doc_copy["_id"]
        return InsertOneResult()
        
    async def update_one(self, filter_dict, update_dict, upsert=False):
        target_doc = None
        for doc in self.documents:
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                target_doc = doc
                break
                
        if not target_doc:
            if upsert:
                new_doc = filter_dict.copy()
                if "_id" not in new_doc:
                    new_doc["_id"] = str(uuid.uuid4())
                if "$set" in update_dict:
                    new_doc.update(update_dict["$set"])
                self.documents.append(new_doc)
                return True
            return False
            
        if "$set" in update_dict:
            target_doc.update(update_dict["$set"])
            
        if "$push" in update_dict:
            for k, v in update_dict["$push"].items():
                if k not in target_doc or target_doc[k] is None:
                    target_doc[k] = []
                if isinstance(v, dict) and "$each" in v:
                    target_doc[k].extend(v["$each"])
                else:
                    target_doc[k].append(v)
        return True
        
    def find(self, filter_dict=None):
        if filter_dict is None:
            filter_dict = {}
        matched = []
        for doc in self.documents:
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                matched.append(doc.copy())
        return MockCursor(matched)

    async def delete_one(self, filter_dict):
        for i, doc in enumerate(self.documents):
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                self.documents.pop(i)
                return True
        return False

class MockDatabase:
    def __init__(self):
        self.collections = {}
        
    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection(name)
        return self.collections[name]

# Global DB Client Setup
db_client = None
db = None

def get_database():
    global db_client, db
    
    if settings.MOCK_MODE:
        if db is None or not isinstance(db, MockDatabase):
            logger.info("Initializing in-memory Mock Database (MOCK_MODE=True)")
            db = MockDatabase()
        return db
        
    if db is None:
        try:
            logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}")
            db_client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
            db = db_client[settings.DATABASE_NAME]
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}. Falling back to Mock Database.")
            db = MockDatabase()
            
    return db
