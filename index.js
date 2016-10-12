#!/usr/bin/env node

const request = require('request');
const jsonfile = require('jsonfile');
const fs = require('fs');
const inquirer = require('inquirer')
const db = require('sqlite')
const chalk = require('chalk');
db.open('base.db').then((res) => {
  db.run("CREATE TABLE IF NOT EXISTS films (titre)")
})
const program = require('commander')

//Commander
program
.version('0.1')
.option('-p, --pop', 'Les films les plus populaires')
.option('-r, --resume', 'Resume du film')
.option('-m, --myfilms', 'Les films deja vu')
.parse(process.argv)

if(program.pop) {
  //appel API TMDB avec request
  request('https://api.themoviedb.org/3/discover/movie?&api_key=9842ede59f1817b27cd0d02fc70e6b98&language=fr&include_image_language=fr', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //Ecriture fichier JSON
      try {
        fs.writeFile('fichier.json', body, (err) => {
          if (err) throw err
          console.log('Fichier ecrit')
        })
      }
      catch (err) {
        console.error('ERR > ', err)
      }
      //Lecture fichier JSON et affichage dans checkbox
      var file = 'fichier.json'
      jsonfile.readFile(file, function(err, obj) {
        var un = obj['results'][0].title
        var deux = obj['results'][1].title
        var trois = obj['results'][2].title
        var quatre = obj['results'][3].title
        var cinq = obj['results'][4].title
        var six = obj['results'][5].title
        var sept = obj['results'][6].title
        var huit = obj['results'][7].title
        var neuf = obj['results'][8].title
        var dix = obj['results'][9].title
        inquirer.prompt([
          {
            type: 'checkbox',
            message: 'Quel film a tu deja vu ?',
            name: 'films',
            choices: [
              un,
              deux,
              trois,
              quatre,
              cinq,
              six,
              sept,
              huit,
              neuf,
              dix
            ]
          }
        ]).then((answers) => {
          var tab = answers.films;
          for (var i = 0; i < tab.length; i++) {
            // console.log(answers.films[i]);
            db.run("INSERT INTO films VALUES (?)", [answers.films[i]])
          }
        })
      })
    }
  })
}else if(program.resume) {
  //recherche du film
  inquirer.prompt([
    {
      type: 'input',
      message: 'Votre film: ',
      name: 'name'
    }
  ]).then((answers) => {
    //appel API TMDB avec request
    request('https://api.themoviedb.org/3/search/movie?&query='+answers.name+'&api_key=9842ede59f1817b27cd0d02fc70e6b98&language=fr&include_image_language=fr', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        //Ecriture fichier JSON
        try {
          fs.writeFile('fichier.json', body, (err) => {
            if (err) throw err
            console.log('Fichier ecrit')
          })
        }
        catch (err) {
          console.error('ERR > ', err)
        }
        //Lecture fichier JSON et affichage dans checkbox
        var file = 'fichier.json'
        jsonfile.readFile(file, function(err, obj) {
          var un = obj['results'][0].title
          var deux = obj['results'][0].overview
          console.log(chalk.bold.white.bgRed(un));
          console.log(chalk.italic.black.bgWhite(deux));
        })
      }
    })
  })
}else if(program.myfilms) {
  console.log(chalk.bold.white.bgGreen('Vos films deja vu :'));
  db.open('base.db').then((res) => {
    db.run("CREATE TABLE IF NOT EXISTS films (titre)")
    db.each("SELECT * FROM films", function(err, row) {
      console.log(row.titre);
    })
  })
} else {
  program.help()
}
