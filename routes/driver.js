const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const joi = require('joi');
//package for making HTTP Request
var request=require("request");
const mongoose = require('mongoose');
const express = require('express');
var http = require('http');
var fs = require('fs');
const logger = require('../startup/logging');
const regCtrl = require('../controller/registrationController');
const LocController = require('../controller/locationController');
const router = express.Router();

router.patch('/driver/:id', async (req, res) => {
    let email = req.body.email;
  
    const { error } = validateMovie(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
  
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).send('Invalid Admin Id.');
  
    const user = await user.findByIdAndUpdate(req.params.id,
      { 
        email: req.body.email,
        name: req.body.name
      }, { new: true });
  
    if (!movie) return res.status(404).send('The movie with the given ID was not found.');
    
    res.send(movie);
  });
  
  function validateMovie(movie) {
    const schema = {
      title: Joi.string().min(5).max(50).required(),
      genreId: Joi.objectId().required(),
      numberInStock: Joi.number().min(0).required(),
      dailyRentalRate: Joi.number().min(0).required()
    };
  
    return Joi.validate(movie, schema);
  }
  
  // router.delete('/:id', async (req, res) => {
  //   const movie = await Movie.findByIdAndRemove(req.params.id);
  
  //   if (!movie) return res.status(404).send('The movie with the given ID was not found.');
  
  //   res.send(movie);
  // });
  
  // router.get('/:id', async (req, res) => {
  //   const movie = await Movie.findById(req.params.id);
  
  //   if (!movie) return res.status(404).send('The movie with the given ID was not found.');
  
  //   res.send(movie);
  // });
  


module.exports = router; 