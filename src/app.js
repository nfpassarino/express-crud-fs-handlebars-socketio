const path = require('path');
const http = require('http');
const handlebars = require('express-handlebars');
const moment = require('moment');
const { Server } = require('socket.io');
const productRoutes = require('./routes/productRoutes');
const productController = require('./product/productController');
const messageController = require('./message/messageController');

const express = require('express');
const app = express();

// initialize server

const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
const io = new Server(server);

// view settings

app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', handlebars({
    extname: '.hbs',
    defaultLayout: 'layout',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
}));
app.set('view engine', '.hbs');

// middlewares

app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());
app.use('/api/productos', productRoutes);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salio mal :(');
});

// root

app.get('/', async (req, res) => {
    res.render('productView');
});

// socket

io.on('connection', socket => {
    console.log('New connection: ', socket.id);

    socket.on('client:productList', () => {
        productController.fetchAllProducts()
            .then(products => {
                socket.emit("server:productList", products);
            })
    });

    socket.on('client:newProduct', (newProduct) => {
        productController.writeNewProduct(newProduct)
            .then(productId => {
                console.log('nuevo producto en el server ' + productId);
                io.sockets.emit("server:changeProductList");
            });
    });

    socket.on('client:messages', () => {
        messageController.fetchAllMessages()
            .then(messages => {
                socket.emit("server:messages", messages);
            })
    });

    socket.on('client:newMessage', (newMessage) => {
        messageController.writeNewMessage(newMessage)
            .then(messageId => {
                console.log('nuevo mensaje en el server ' + messageId);
                io.sockets.emit("server:newMessage");
            });
    });

    socket.on('disconnect', () => {
        console.log(socket.id, ' disconnect');
    });
});

server.listen(PORT, () => {
    console.log(`Servidor http escuchando en el puerto ${PORT}`);
});
