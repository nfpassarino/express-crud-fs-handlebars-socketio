const socket = io();

let script = document.querySelector("#template").innerHTML;

let productContainer = document.querySelector("#productContainer");

socket.on('server:loadproducts', data => {
    let products = JSON.parse(data);
    console.log(products);
    let template = Handlebars.compile(script);
    let html = template(products);
    console.log('html ' + html);
    productContainer.innerHTML = html;
});

const sendNewProduct = () => {
    console.log('enviaaaaandooooo')
    const title = document.getElementById("inputTitle").value;
    const price = document.getElementById("inputPrice").value;
    const thumbnail = document.getElementById("inputThumbnail").value;
    const successAlert = document.getElementById("successAlert");
    const productName = document.getElementById("productName");
    socket.emit('client:newproduct', JSON.stringify({
        "title": title,
        "price": Number(price),
        "thumbnail": thumbnail
    }));
    productName.innerText = title;
    successAlert.classList.add('show');
};
