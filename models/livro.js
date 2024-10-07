const mongoose = require('mongoose')

const livroSchema = new mongoose.Schema({
    titulo: String,
    identificador: String,
    comentario: String
})

const Livro = mongoose.model('Livro', livroSchema)

module.exports = Livro