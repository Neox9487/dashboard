import mysql.connector

class MySQLHelper():
  def __init__(self):
    self.db = mysql.connector.connect(
      host='localhost',   
      user='root',    
      password='password',
      database = "dashboard"
    ) 
    self.mycursor = self.db.cursor()

  def get_settings(camera_id: int):
    pass