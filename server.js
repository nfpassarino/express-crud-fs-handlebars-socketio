const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require("socket.io");
const handlebars = require("express-handlebars");
const productsRoute = require('./routes/products');
const fileHelper = require('./helpers/fileHelper');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 8080;

let products = [];

// settings

app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', handlebars({
    extname: '.hbs',
    defaultLayout: 'layout',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
}));
app.set('view engine', '.hbs');

// middlewares

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use('/api/productos', productsRoute);

app.get('/', async (req, res) => {
    fileHelper.fetchAllProducts()
        .then(data => {
            products = data;
            res.render('index');
        })
        .catch(e => console.error(e));
});

io.on('connection', socket => {
    console.log('New connection: ', socket.id);

    socket.emit('server:loadproducts', JSON.stringify(products));

    socket.on('client:newproduct', newProduct => {
        console.log('nuevo producto en el server ' + JSON.parse(newProduct))
        fileHelper.writeNewProduct(JSON.parse(newProduct))
            .then(id => {
                fileHelper.fetchAllProducts()
                    .then(data => products = data)
                    .catch(e => console.error(e));
                socket.emit('server:loadproducts', JSON.stringify(products));
            })
            .catch(e => console.error(e));
    });

    socket.on("disconnect", () => {
        console.log(socket.id, " disconnected");
    });
});

server.listen(PORT, () => {
    console.log(`Servidor http escuchando en el puerto ${PORT}`);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salio mal :(');
});
