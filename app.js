const express = require('express')
const request = require('request')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const Livro = require('./models/livro')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/search', (req, res) => {
    let {busca, tipo} = req.query
    if (!tipo) tipo = ""
    let resposta = {}
    request("https://www.googleapis.com/books/v1/volumes?q=" + tipo + busca, (error, response, body) => {
        if(!error && response.statusCode == 200){
            resposta = JSON.parse(body)
        }
        res.render('search', {resposta})
    })
})

app.post('/insert', async (req, res) => {
    const {titulo, identificador} = req.body
    const comentario = ""
    const novoLivro = new Livro({titulo, identificador, comentario})
    await novoLivro.save()
    res.redirect('/')
})

app.get('/list', async (req, res) => {
    const livros = await Livro.find({})
    res.render('list', {livros})
})

app.get('/details/:id', async (req, res) => {
    const {id} = req.params
    const bd = await Livro.findOne({identificador: id})
    let resposta = {}
    request("https://www.googleapis.com/books/v1/volumes/" + id, (error, response, body) => {
        if(!error && response.statusCode == 200) {
            resposta = JSON.parse(body)
        }
        res.render('details', {resposta, bd})
    })
})

app.patch('/details/:id', async (req, res) => {
    const {id} = req.params
    await Livro.findByIdAndUpdate(id, req.body, {runValidators: true})
    res.redirect('/list')
})

app.delete('/delete/:id', async (req, res) => {
    const {id} = req.params
    await Livro.findByIdAndDelete(id)
    res.redirect('/list')
})

mongoose
    .connect('mongodb://localhost:27017/mongodb', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        app.listen(3000)
        console.log("Conexão estabelecida com o banco.")
    })
    .catch(err => {
        console.log("Erro ao conectar com o banco.")
        console.log(err)
    })
