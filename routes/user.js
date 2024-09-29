const express = require("express");
const router = express.Router();
const assert = require("assert");
router.use(express.urlencoded({ extended: true }));

/**
 * @desc Renders the home page
 */
router.get("/home", (req, res) => {
  res.render("home");
});

/**
 * @desc Renders the page for authors
 */
router.get("/authors", requireLogin ,(req, res, next) => {
  //sql statement to get articles and orders them by article creation date
  let sqlAuthorArticles = "SELECT * FROM Articles ORDER BY articleCreationDate DESC";
  global.db.all(sqlAuthorArticles, function (err, rows) {
    if (err) {
      next(err);
    } else {
      //sql statement to get from the comments database table
      let sqlComments = "SELECT * FROM Comments";
      global.db.all(sqlComments, function(err, rows2){
        if(err){
          next(err);
        }
        else{
          //sql statement to get from authorSettings table with referencing to the author_user_id
          let sqlSettings = "SELECT * FROM authorSettings WHERE authors_user_id = ?";
          global.db.all(sqlSettings, 1,function(err, rows3){
            if(err){
              next(err);
            }
            else{
              //renders the authors page while passing the information from articles, comments and authorSettings
              res.render("authors", {articles: rows, comments: rows2, authorSettings: rows3});
            }
          });
        }
      });
    }
  }
);
});

/**
 * @desc Renders the page for author's settings
 */
router.get("/authors-settings", (req, res, next) => {
  //sql statement to get from authorSettings with reference to the author_user_id
  let sqlSettings = "SELECT * FROM authorSettings WHERE authors_user_id = ?";
  global.db.all(sqlSettings, 1, function(err, rows){
    if(err){
      next(err);
    }
    else{
      //renders the settings page with information from authorSettings
      res.render("settings", {authorSettings: rows});
    }
  });
});

/**
 * @desc Renders the saving of the author's settings
 */
router.post("/SaveSettings/:authors_user_id", (req, res, next) => {
  const authorsUserId = req.params.authors_user_id;
  //sql statment to update the authorSettings table to set the blogTitle, blogSubtitle and authors_name to the input values according to the author_user_id
  let sqlUpdateSettings = "UPDATE authorSettings SET `blogTitle` = ?, `blogSubtitle` = ?, `authors_name` = ? WHERE `authors_user_id` = ?"
  let updateSettings = [req.body.blogTitle, req.body.blogSubtitle, req.body.authors_name, authorsUserId];
  global.db.all(sqlUpdateSettings, updateSettings, function(err, row){
    if(err){
      next(err);
    }
    else{
      res.redirect("/user/authors");
      console.log(updateSettings);
    }
  });
});

/**
 * @desc Renders the page for authors to delete their articles
 */
router.get("/deleteArticle/:articleID", (req, res, next) => {
  let recordID = req.params.articleID;
  let sql = "SELECT * FROM Articles WHERE articleID=?";
  global.db.all(sql, recordID, function(err, rows){
    if(err){
      next(err);
    }
    else{
      //sql statement to get from the comments database table
      let sqlComments = "SELECT * FROM Comments";
      global.db.all(sqlComments, function(err, rows2){
        if(err){
          next(err);
        }
        else{
          //sql statement to get from authorSettings table with referencing to the author_user_id
          let sqlSettings = "SELECT * FROM authorSettings WHERE authors_user_id = ?";
          global.db.all(sqlSettings, 1,function(err, rows3){
            if(err){
              next(err);
            }
            else{
              //renders the authors page while passing the information from articles, comments and authorSettings
              res.render("authors", {articles: rows, comments: rows2, authorSettings: rows3});
            }
          });
        }
      });
    }
  });
});


/**
 * @desc Renders the saving of deleting of articles
 */
router.post("/deleteArticle/:articleID", (req, res, next) => {
  let DeleteID = req.params.articleID;
  let sqlDelete = "DELETE FROM Articles WHERE articleID = ?";
  global.db.run(sqlDelete, [DeleteID], function(err){
    if(err){
      next(err);
    }
    else{
      res.redirect("/user/authors");
      console.log(`Article has been deleted`);
      //next();
    }
  })
});

/**
 * @desc Renders the creating articles page
 */
router.get("/create-article", (req, res, next) => {
  res.render("create-article");
});

/**
 * @desc Renders the creating articles and saving of a draft
 */
router.post("/create-article", (req, res, next) => {
  //sql statement about posting information into the Article table
  let sql = "INSERT INTO Articles ('articleID','articleTitle', 'articleSubtitle', 'articleText', 'articleCreationDate', 'articleLastModDate', 'articlePublishedDate', 'articleState') VALUES(?, ?, ?, ?, ?, ?, ?, ?)";
  const data = [req.body.articleID, req.body.articleTitle, req.body.articleSubtitle, req.body.articleText, new Date().toISOString(), new Date().toISOString(), new Date().toISOString(), req.body.articleState];
  global.db.run(sql, data, function(err){
    if(err){
      next(err);
    }
    else{
      console.log(`New data inserted @ id ${this.lastID}!`);
      res.redirect("/user/authors");
    }
  });
});

/**
 * @desc Renders the editing articles page
 */
router.get("/edit/:articleID", (req, res, next) => {
  let recordID = req.params.articleID;
  let sql = "SELECT * FROM Articles WHERE articleID=?";
  global.db.all(sql, recordID, function(err, row){
    if(err){
      next(err);
    }
    else{
      res.render("edit", {articles: row});
    }
  });
});

/**
 * @desc Renders the saving of editing of articles page
 */
router.post("/edit/:articleID", (req, res, next) => {
  let recordID = req.params.articleID;
  //updates the Articles table with the relevant inputs
  let sqlSave = "UPDATE Articles SET articleTitle = ?, articleSubtitle = ?, articleText = ?, articleLastModDate = ? WHERE articleID = ?";
  const data = [req.body.articleTitle, req.body.articleSubtitle, req.body.articleText, new Date().toISOString(), recordID];
  global.db.run(sqlSave, data, function(err){
    if(err){
      next(err);
    }
    else{
      res.redirect("/user/authors");
      console.log(`Article has been updated`);
    }
  })
});

/**
 * @desc Renders the publishing of draft articles
 */
router.post("/publishDraft/:articleID", function(req, res, next){
  let recordID = req.params.articleID;
  // Updates the articleState to 1 in the Articles table
  let sqlPublishDraft = "UPDATE Articles SET articleState = 1, articlePublishedDate = ? WHERE articleID = ?";
  const data = [new Date().toISOString(), recordID];
  global.db.run(sqlPublishDraft, data, function (err) {
    if (err) {
      next(err);
    } else {
      res.redirect("/user/authors");
      console.log(`Article has been published`);
    }
  });
});


/**
 * @desc Renders the page for a user to read articles
 */
router.get("/user", (req, res, next) => {
  //articleState =1 means article has been published and this statement filters out those published articles and sorts them according to the creation date
  let sql = "SELECT * FROM Articles WHERE articleState = 1 ORDER BY articleCreationDate DESC";
  global.db.all(sql, function(err, rows){
    if(err){
      next(err);
    }
    else{
      let sqlComments = "SELECT * FROM Comments";
      global.db.all(sqlComments, function(err, rows2){
        if(err){
          next(err);
        }
        else{
          let sqlSettings = "SELECT * FROM authorSettings WHERE authors_user_id = ?";
          global.db.all(sqlSettings, 1,function(err, rows3){
            if(err){
              next(err);
            }
            else{
              res.render("user", {articles: rows, comments: rows2, authorSettings: rows3});
            }
          });
        }
      });
      
    }
  });
});

/**
 * @desc Renders the like function for a user to like articles
 */
router.post("/user-like/:articleID", (req, res, next) =>{
  let recordID = req.params.articleID;
  //sql statement to record the ability to 'like' an article by updating the Articles table
  let sqlLike = "UPDATE Articles SET articleLikes = articleLikes + 1 WHERE articleID = ?";
  const data = [recordID];
  global.db.run(sqlLike, data, function(err){
    if(err){
      next(err);
    }
    else{
      res.redirect("/user/user");
      console.log('You have liked the article');
    }
  })
});

/**
 * @desc Renders the comment function for a user to comment on articles
 */
router.post("/user-comment/:articleID", (req, res, next) => {
  let ID = req.params.articleID;
  let commentCreationDate = new Date().toISOString();
  //Checks if the artilce has an articleState of 1
  let sqlCheckState = "SELECT articleID FROM Articles WHERE articleID =? AND articleState = 1";
  global.db.get(sqlCheckState, [ID], (err, row) =>{
    if(err){
      next(err);
    }
    else if(row){
      //Allows you to add the comment
      let sqlInsertComment = "INSERT INTO Comments (commentCreationDate, commentContent, articleID) VALUES(?, ?, ?)";
      const data = [new Date().toISOString(), req.body.commentContent, req.body.articleID];
      global.db.run(sqlInsertComment, data, function(err){
        if(err){
          next(err);
        }
        else{
          console.log('New comment added @ commentID ${this.lastID} for article ${articleID}');
          //redirects to the reader's page 
          res.redirect('/user/user');
        }
      });
    }
    else{
      //As article is not published, it will show an error and redirect to an appropriate page
      res.status(403).send("Only able to comment on published articles");
    }
  });
});

/**
 * @desc Renders the comment function for the author to comment on articles
 */
router.post("/author-comment/:articleID", (req, res, next) => {
  let ID = req.params.articleID;
  let commentCreationDate = new Date().toISOString();
  //Checks if the artilce has an articleState of 1
  let sqlCheckState = "SELECT articleID FROM Articles WHERE articleID =? AND articleState = 1";
  global.db.get(sqlCheckState, [ID], (err, row) =>{
    if(err){ //sends error to the next handler
      next(err);
    }
    else if(row){
      //Allows you to add the comment
      let sqlInsertComment = "INSERT INTO Comments (commentCreationDate, commentContent, articleID) VALUES(?, ?, ?)";
      const data = [new Date().toISOString(), req.body.commentContent, req.body.articleID];
      global.db.run(sqlInsertComment, data, function(err){
        if(err){
          next(err);
        }
        else{
          console.log('New comment added @ commentID ${this.lastID} for article ${articleID}');
          res.redirect('/user/authors');
        }
      });
    }
    else{
      //As article is not published, it will show an error and redirect to an appropriate page
      res.status(403).send("Only able to comment on published articles");
    }
  });
});

/**
 * @desc Allows to sort the comments according to commentCreationDate
 */
router.get("/user-comment/:articleID", (req, res, next) => {
  let ID = req.params.articleID;
  //Retrieves comments for the specific article and orders them by commentCreationDate
  let sqlGetComments = "SELECT * FROM Comments WHERE articleID =? ORDER BY commentCreationDate";
  global.db.all(sqlGetComments, [ID], function(err, rows){
    if(err){
      next(err);
    }
    else{
      res.render("user", {comments: rows});
    }
  });
});


//////////////////////////////////////////// EXTENSION ///////////////////////////////////////////
//To check if the user is authenticated
function requireLogin(req, res, next){
  if(req.session && req.session.isAuthenticated){
    return next();
  }
  else{
    res.redirect("authorLogin");
  }
}
//Renders the login page for author & checks if the user_id equals to what is given in the database
router.get("/authorLogin", (req, res, next)=> {
  const sqlUser = "SELECT * FROM User WHERE user_id = ?";
  global.db.get(sqlUser, [1], (err, row) =>{
    if(err){
      next(err);
    }
    if(!row){
      res.status(404).send("User not found");
      return;
    }
    res.render("authorLogin", {User: row});
  })
});

//Sends the author login form submission
router.post("/authorLogin", (req, res, next) => {
  let sqlLogin = "SELECT * FROM User WHERE user_id = ? AND user_name = ? AND pw = ?";
  const loginData = [req.body.user_id ,req.body.user_name, req.body.pw];
  console.log(loginData);
  global.db.get(sqlLogin, loginData, (err, rows) => {
    if(err){
      next(err);
    }
    else if (rows){
      //If login is successful, will redirect to the author page & sets isAuthenticated to a true value
      req.session.isAuthenticated = true;
      res.redirect("/user/authors");

    }
    else{
      //If not will show an error upon entering wrong credentials
      res.status(401).send("Invalid Credentials");
    }
  })
});

//To render the login page when someone clicks on the authors page
router.get("/user/authors", requireLogin, (req, res) => {
  //fetches the data from the database
  res.render("authors");
});


///////////////////////////////////////////// HELPERS ///////////////////////////////////////////

module.exports = router;
