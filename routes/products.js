const express = require('express');
const productAPI = express.Router();
const fileHelper = require('./../helpers/fileHelper');

productAPI.get('/', (req, res) => {
    fileHelper.fetchAllProducts()
        .then(data => res.json({
            message: 'Lista de productos',
            data: data
        }))
        .catch(e => console.error(e));
});

productAPI.get('/random', (req, res) => {
    fileHelper.fetchRandomProduct()
        .then(random => res.json({
            message: 'Producto aleatorio',
            data: random
        }))
        .catch(e => console.error(e));
});

productAPI.get('/:id', (req, res) => {
    const { id } = req.params;
    fileHelper.fetchProductById(id)
        .then(result => {
            result === null
                ? res.json({
                    message: 'Producto no encontrado :(',
                })
                : res.json({
                    message: 'Producto encontrado',
                    data: result
                })
        })
        .catch(e => console.error(e));
});

productAPI.post('/', (req, res) => {
    const newProduct = req.body;
    fileHelper.writeNewProduct(newProduct)
        .then(id => {
            fileHelper.fetchProductById(id)
                .then(pro => res.json({
                    message: 'Producto guardado',
                    data: pro
                }))
        })
        .catch(e => console.error(e));
});

productAPI.put('/:id', (req, res) => {
    const { id } = req.params;
    const newProduct = req.body;
    fileHelper.updateProduct(id, newProduct)
        .then(id => {
            fileHelper.fetchProductById(id)
                .then(pro => res.json({
                    message: 'Producto actualizado',
                    data: pro
                }))
        })
        .catch(e => console.error(e));
});

productAPI.delete('/:id', (req, res) => {
    const { id } = req.params;
    fileHelper.deleteProduct(id)
        .then(all => res.json({
            message: 'Producto eliminado',
            data: all
        }))
        .catch(e => console.error(e));
});

module.exports = productAPI;
