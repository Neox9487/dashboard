from server import Server

app = Server(host="0.0.0.0", port=8000)

if __name__ == "__main__":
  app.start()