import psycopg2
import os
from dotenv import load_dotenv
import sqlalchemy
load_dotenv()

def get_connection():
    return psycopg2.connect(os.environ["DATABASE_URL"])
    
