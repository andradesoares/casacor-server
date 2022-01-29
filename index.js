const app = require('./app');

const start = () => {
  //App start
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server started listening on port ${port}!`));
};

start();
