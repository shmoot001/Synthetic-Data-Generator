from pymongo import MongoClient

def get_mongo_collection(db_name="synthetic_data", collection_name="generated"):
    client = MongoClient("mongodb://mongo:27017/")
    db = client[db_name]
    return db[collection_name]
