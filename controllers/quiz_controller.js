//GET /quizes/question
exports.question = function(req,res){
	res.render('quizes/question', {pregunta : 'Capital de España'});
}

//GET /quizes/answer
exports.answer = function(req,res){
	if(req.query.respuesta === "Madrid"){
		res.render('quizes/answer', {respuesta : 'Correcta'});
	} else {
		res.render('quizes/answer', {respuesta : 'Incorrecta'});		
	}

}

//GET /author
exports.author = function(req,res){
	res.render('author', {});
}