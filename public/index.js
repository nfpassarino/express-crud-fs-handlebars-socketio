import { initializeUI, renderProductList, renderChat } from './ui.js';

const socket = io();
const getProductList = () => socket.emit('client:productList');
const getMessages = () => socket.emit('client:messages');

initializeUI();

socket.emit('client:productList');
socket.emit('client:messages');
socket.on('server:changeProductList', getProductList);
socket.on('server:newMessage', getMessages);

socket.on('server:productList', data => {
    renderProductList(data);
});

socket.on('server:messages', data => {
    renderChat(data);
});

