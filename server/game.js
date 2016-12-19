var mongodb = require('mongodb');
var ObjectID = mongodb.ObjectID;
var MongoClient = require('mongodb').MongoClient;
var Player = require('./player.js');

var Game = function(){
  this.players = [];
  this.gameState = [];
};

Game.prototype = {

  addPlayer: function(playerName, res){
    // var color = this.getNextColor();
    var color = 'ff0000';
    var options = {name: playerName, color: color};
    var player = new Player(options);
    var url = 'mongodb://localhost:27017/game';
    MongoClient.connect(url, function(err, db){
      if(err){
        throw err;
      };
      var collection = db.collection('players');
      collection.insert(player, function(err, dbResponse){ 
        this.players.push(player);
        this.sendClientSafeMarkersFromDb(res, player._id);
        db.close();
      }.bind(this));
    }.bind(this));
  },

  runDbQuery: function(projection, runMeWhenDone, database, dbCollection){

    var url = 'mongodb://localhost:27017/' + database;
    MongoClient.connect(url, function(err, db){
      if(err){
        throw err;
      };
      var collection = db.collection(dbCollection);
      collection.find({}, projection).toArray(function(err, docs){

        runMeWhenDone(docs);
        db.close();
      });
    });
  },

  getPlayersFromDb: function(){
    this.runDbQuery({}, 
      function(docs){
        this.players = docs;
      }.bind(this), 
      'game', 
      'players');
  },

  getGameStateFromDb: function(){
    this.runDbQuery({}, 
      function(docs){
        this.gameState = docs;
      }.bind(this), 
      'game', 
      'gameStates'
      );
  },

  sendClientSafeMarkersFromDb: function(res, clientPlayerId){
    var markersForClient = this.runDbQuery({
      _id: 0,
      position: 1,
      alpha2Code: 1,
      playerId: 1,
      label: 1,
      color: 1
    },
    function(docs){
      var data = {
        clientPlayerId: clientPlayerId,
        markersData: docs
      }
      res.json(data);
    },
    'game',
    'gameStates'
    );
  }

};

module.exports = Game;
