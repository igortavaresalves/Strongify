from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Collections
usuarios_collection = db.usuarios
treinos_collection = db.treinos
atribuicoes_collection = db.atribuicoes
execucoes_collection = db.execucoes

async def close_db_connection():
    client.close()