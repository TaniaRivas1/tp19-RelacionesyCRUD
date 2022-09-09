const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment')


//Aqui tienen una forma de llamar a cada uno de los modelos
// const {Movies,Genres,Actor} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll({
            include: [
                { association: "genre" },
                { association: "actors" }
            ]
        })
            .then(movies => {
                //return res.send(movies)
                res.render('moviesList.ejs', { movies })
            })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id)
            .then(movie => {
                res.render('moviesDetail.ejs', { movie });
            });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order: [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', { movies });
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: { [db.Sequelize.Op.gte]: 8 }
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', { movies });
            });
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    add: function (req, res) {
        db.Genre.findAll({
            order: [
                ['name', 'ASC']
            ]
        })
            .then(genres => {
                return res.render('moviesAdd', {
                    genres
                })
            })
            .catch(error => console.log(error))

    },
    create: function (req, res) {
        const {title,awards,release_date,genre_id,rating,length} = req.body
      db.Movie.create({
        title : title.trim(),
        awards : +awards,
        release_date,
        genre_id : +genre_id,
        rating : +rating,
        length : +length
      })

      .then(movie => {
        console.log(movie);
        return res.redirect('/movies/detail/' + movie.id)
      })
      .catch(error => console.log(error))
    },
    edit: function(req, res) {
        let movie =  db.Movie.findByPk(req.params.id)
        let genres = db.Genre.findAll({
         order : ['name']
        })
        Promise.all([movie,genres])
         .then(([movie,genres]) =>{
             return res.render('moviesEdit', {
                 Movie:movie,
                 release_date: moment(movie.release_date).format('YYYY-MM-DD'),
                 genres
             })
         })
         .catch(error =>console.log(error))
     },
     update: function (req,res) {
        const {title,awards,release_date,genre_id,rating,length} = req.body
        //return res.send(req.body)
        db.Movie.update({
            title : title.trim(),
            awards : +awards,
            release_date: release_date,
            genre_id : +genre_id,
            rating : +rating,
            length : +length
        },{
            where:{
                id: req.params.id
            }
        }).then(() => res.redirect('/movies'))
        .catch(error => console.log(error))
    },
    delete: function (req, res) {
        db.Movie.findByPk(req.params.id)
        .then(movie => res.render('moviesDelete',{
            movie
        })).catch(error => console.log(error))
    },
    destroy: function (req, res) {
        //return res.send(req.params.id)
        db.Movie.destroy({
            where:{
                id: req.params.id
            },
            include: [
                {association: "actors"}
            ]
        }).then(()=> res.redirect('/movies'))
        .catch(error => console.log(error))
    }
}

module.exports = moviesController;