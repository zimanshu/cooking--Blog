require('../models/database');
const res = require('express/lib/response');
const Category = require('../models/Category');
const Recipe = require('../models/Recipe');
const Contact = require('../models/Contact');


 /**
  * GET / 
  * Homepage
  */
exports.homepage = async(req, res) => {
  try{
    const limitNumber = 5;
    const categories = await Category.find({}).limit(limitNumber);
    const latest = await Recipe.find({}).sort({_id: -1}).limit(limitNumber);
    const thai = await Recipe.find({ 'category': 'Thai'}).limit(limitNumber);
    const american = await Recipe.find({ 'category': 'American'}).limit(limitNumber);
    const chinese = await Recipe.find({ 'category': 'Chinese'}).limit(limitNumber);
    const food = { latest, thai, american, chinese };
    res.render('index', { title: 'Cooking Blog-Home', categories, food } );    
  }catch(error){
    res.status(500).send({message: error.message || "Error Occured"});
  }
}


/**
  * GET /catergories/ 
  * Categories 
  */
exports.exploreCategories = async(req, res) => {
  try{
    const limitNumber = 5;
    const categories = await Category.find({}).limit(limitNumber);
    res.render('categories', {title: 'Cooking Blog - Categories', categories} );    
  }catch(error){
    res.status(500).send({message: error.message || "Error Occured"});
  }
}

/**
  * GET /catergories/:id 
  * Categories by Id
  */
 exports.exploreCategoriesById = async(req, res) => {
  try{
    let categoryId = req.params.id;
    const limitNumber = 20;
    const categoryById = await Recipe.find({ 'category': categoryId }).limit(limitNumber);
    res.render('categories', {title: 'Cooking Blog - Categories', categoryById} );    
  }catch(error){
    res.status(500).send({message: error.message || "Error Occured"});
  }
}

/**
  * GET /recipe/:id 
  * Recipe 
  */
 exports.exploreRecipe = async(req, res) => {
  try{
    let recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    res.render('recipe', {title: 'Cooking Blog - Recipe', recipe} );    
  }catch(error){
    res.status(500).send({message: error.message || "Error Occured"});
  }
}


/**
  * POST /search 
  * Search
  */
 exports.searchRecipe = async(req, res) => {
   try{
     let searchTerm = req.body.searchTerm;
     let recipe = await Recipe.find( { $text: { $search: searchTerm, $diacriticSensitive: true } });
     res.render('search', {title: 'Cooking Blog - Search', recipe } );
    } catch (error){
     res.status(500).send({message: error. message || "Error Occured" });
   }
 }

/**
  * GET /explore-latest
  * Explore Latest
  */
 exports.exploreLatest = async(req, res) => {
  try{
    const limitNumber = 20;
    const recipe = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
    res.render('explore-latest', {title: 'Cooking Blog - Explore', recipe} );    
  }catch(error){
    res.status(500).send({message: error.message || "Error Occured"});
  }
}


/**
  * GET /explore-random
  * Explore Random
  */
 exports.exploreRandom = async(req, res) => {
  try{
    let count = await Recipe.find().countDocuments();
    let random = Math.floor(Math.random() * count);
    let recipe = await Recipe.findOne().skip(random).exec();
    res.render('explore-random', {title: 'Cooking Blog - Explore', recipe} );    
  }catch(error){
    res.status(500).send({message: error.message || "Error Occured"});
  }
}

/**
  * GET /submit-recipe
  * Submit Recipe
  */
 exports.submitRecipe = async(req, res) => {
   const infoErrorsObj = req.flash('infoErrors');
   const infoSubmitObj = req.flash('infoSubmit');
  res.render('submit-recipe', {title: 'Cooking Blog - Submit Recipe', infoErrorsObj, infoSubmitObj } );    
}

/**
  * POST /submit-recipe
  * Submit Recipe 
  */
 exports.submitRecipeOnPost = async(req, res) => {
   try{

    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if(!req.files || Object.keys(req.files).length === 0){
      console.log('No Files where uploaded.');
    } else {
      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;

      uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

      imageUploadFile.mv(uploadPath, function(err){
        if(err) return res.status(500).send(err);
      });
      
    }
     const newRecipe = new Recipe({
       name: req.body.name,
       description: req.body.description,
       email: req.body.email,
       ingredients: req.body.ingredients,
       category: req.body.category,
       image: newImageName
     });
     await newRecipe.save();
    req.flash('infoSubmit', 'Recipe has been added.')
    res.redirect('/submit-recipe');
   } catch(error){
    req.flash('infoErrors', error);
    res.redirect('/submit-recipe');
   }
  
}


/**
  * Get /about 
  * About
  */
 exports.About = async(req, res) => {
    res.render('about', {title: 'Cooking Blog - About'} );
}


/**
  * Post /Contact 
  * Contact
  */
 exports.Contact = async(req, res) => {
  const newinfoErrorsObj = req.flash('newinfoErrors');
  const newinfoSubmitObj = req.flash('newinfoSubmit');
  res.render('contact', {title: 'Cooking Blog - Contact', newinfoErrorsObj, newinfoSubmitObj} );
}


/**
  * POST /contact
  * Contact 
  */
 exports.contactOnPost = async(req, res) => {
  try{
     const newContact = new Contact({
      name: req.body.name,
      email: req.body.email,
      description: req.body.description,
    });
    await newContact.save();
    req.flash('newinfoSubmit', 'Information has been Sent.')
    res.redirect('/contact');
  } catch(error){
   req.flash('newinfoErrors', error);
   res.redirect('/contact');
  }
}
