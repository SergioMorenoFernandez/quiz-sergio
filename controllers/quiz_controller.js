var models =require ('../models/models.js');


exports.load = function (req,res,next,quizId) {
models.Quiz.find({
	where: { id: Number(quizId) },
	include: [{model: models.Comment}] 
}).then(
	function(quiz){
		if(quiz){
			req.quiz=quiz;
			next();
		}
		else
		{
			next(new Error('No existe quizId=' + quizId));
		}
	}).catch(function(error) {next(error);});
};

// exports.index = function(req,res){
// 	models.Quiz.findAll().then(function(quizes){
// 		res.render('quizes/index', {quizes:quizes, errors: []});
// 	}).catch(function(error) {next(error);})
// };

// GET /quizes
exports.index = function(req, res) {
  var textoABuscar = "";
  var aux;
  if(req.query.search !== undefined){
    aux = req.query.search.split(" ");
    for(i in aux){
      textoABuscar = textoABuscar + "%" + aux[i];
    }
  }
  models.Quiz.findAll({where: ["pregunta like ?", textoABuscar+"%"]}).then(
    function(quizes) {
      res.render('quizes/index', { quizes: quizes, errors: []});
    }
  ).catch(function(error) { next(error);})
};

//GET /quizes/:id
exports.show = function(req,res){
	res.render('quizes/show', {quiz : req.quiz, errors: []});
};

//GET /quizes/:id/answer
exports.answer = function(req,res){
var resultado ='Incorrecto';
	if(req.query.respuesta === req.quiz.respuesta){
		 resultado ='Correcto'
	}
	res.render('quizes/answer', {quiz : req.quiz, respuesta: resultado, errors: []});
};

// GET /quizes/new
exports.new = function (req,res) {
	var quiz = models.Quiz.build(
		{pregunta: "Pregunta",respuesta:"Respuesta"});

	res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function (req,res) {
	var quiz =models.Quiz.build(req.body.quiz);

	//Guarda los campos de quiz
	quiz
	.validate()
	.then(
		function (err){
			if(err){
				res.render('quizes/new', {quiz:quiz, errors: err.errors});
			}
			else{
				quiz
				.save({fields: ["tema","pregunta","respuesta"]})
				.then(function(){ res.redirect('/quizes')})
			} //Redireccion HTTP a lista de preguntas
		}); 
};

// GET /quizes/:id/edit
exports.edit = function (req,res) {
	var quiz = req.quiz; //autoload de instancia

	res.render('quizes/edit', { quiz: quiz, errors: []});
};


// PUT /quizes/:id
exports.update = function (req,res) {
req.quiz.pregunta= req.body.quiz.pregunta;
req.quiz.respuesta= req.body.quiz.respuesta;
req.quiz.tema= req.body.quiz.tema;

req
.quiz
.validate()
.then(
	function(err) {
			if(err) {
				res.render ('quizes/edit', {quiz: req.quiz, errors: err.errors});
			} else {
				req
				.quiz
				.save({fields: ["tema","pregunta","respuesta"]})
				.then(function(){ res.redirect('/quizes');})
			}
	}).catch(function(error){next(error)});
};

// DELETE /quizes/:id
exports.destroy = function (req,res) {
req.quiz.destroy()
.then(function(){
	res.redirect('/quizes');
	}).catch(function(error){next(error)});
};

//GET /author
exports.author = function(req,res){
	res.render('author', { errors: []});
}

// GET /quizes/statistics

exports.statistics = function(req, res) {

  var statistics = {totalQuizes:0,
                    totalComments:0,
                    avgCommentsQuiz:0,
                    numQuizesWithoutComments:0,
                    numQuizesWithComments:0};

  models.Quiz.count().then(function(countQuizes) {
    statistics.totalQuizes = countQuizes;
    models.Comment.count().then(function(countComments) {
      statistics.totalComments = countComments;
      statistics.avgCommentsQuiz = 
                 (statistics.totalComments/statistics.totalQuizes).toFixed(2);
      models.Quiz.count({include: [{ model: models.Comment, required:true }],
                         distinct: true})
      .then(function(countWithComments) {
        statistics.numQuizesWithComments = countWithComments;
        statistics.numQuizesWithoutComments = statistics.totalQuizes - countWithComments;
        res.render('quizes/statistics', {statistics: statistics, errors: []});
      })
    })
  })

};
