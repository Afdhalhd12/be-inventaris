const express = require('express')
const app = express()
const port = 3000

const db = require("./models")
const methodOverride = require('method-override')
const itemRoutes = require('./routes/item.routes')
const loanRoutes = require('./routes/loan.routes')
const loginRoutes = require('./routes/login.routes')
const {checkToken} = require('./middleware/auth')
//cek koneki model - migration - proyek sequelize
db.sequelize.authenticate()
  .then(() => console.log("Database (model) terkoneksi"))
  .catch((error) => console.error(error))

// app.use : mendaftarkan routing atau config header lain, urutannya sblm, app.get
app.use(express.json()); //mengijinkan req.body format json
app.use(methodOverride("_method")); //menggunakan method put, delete, patch
app.use('/uploads', checkToken, express.static('uploads')); // agar gambar yang disimpan dalam folder upload boleh untuk di ambil/dimunculkan di browser\
app.use('/items', checkToken, itemRoutes); //mendaftarkan routes dab prefix nya
app.use('/loans', checkToken, loanRoutes); //mendaftarkan routes dab prefix nya
app.use('/', loginRoutes); //mendaftarkan routes dab prefix nya

app.get('/', (req, res) => {
  res.send('Hello')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
