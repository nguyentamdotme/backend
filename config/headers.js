export default (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3001");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Credentials', "true");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Origin, content-type, Accept, Authorization");
  // console.log(req.headers);
  next();
}
