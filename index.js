const express = require('express');
const choice_get = require('./routes/choice_get');
const choice_post = require('./routes/choice_post');
const results_get = require('./routes/results_get');

const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/choice', choice_get.get);

app.get('/results', results_get.get);

app.post('/choice', choice_post.post);

app.get('/choices/:projectId', (req, res) => {
    res.redirect('/choices.html?prj=' + req.params.projectId);
});

app.listen(port, () => {
  console.log('Pairwise comp app listening at http://localhost:' + port);
});
