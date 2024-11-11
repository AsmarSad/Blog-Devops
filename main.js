var express=require('express');
var app=express();
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
var path=require('path')
const hbs = require('hbs');
// hbs.registerPartial('header', path.join(__dirname, 'views', 'partials', 'header.hbs'));
dotenv.config();
var uuid=require('uuid')
var mysql=require('mysql2');
var bodyParser=require('body-parser');

var session=require('express-session')
const {body,validationResult}=require('express-validator');
const cookieParser = require('cookie-parser'); 
app.use(express.static(path.join(__dirname, 'public')));
// Database-------------------------------------------------------
console.log(process.env.DB_HOST)
app.set('view engine','hbs');
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json());
var conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
 
conn.connect((err)=>{
    if(err)
   { throw err;}
    console.log("Successfully connected to database")
});
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:true,
    saveUninitialized:true,
    cookie:{maxAge:600000}
}));
// Authentication --------------------------------------------------------------------
app.get('/',(req,res)=>{
    res.render('index') 
});

var message=''
app.get('/login',(req,res)=>{
    res.render('login',{message:message})
})
app.post('/login', 
body('username').not().isEmpty().withMessage('Please, fill Username'),
body('password').not().isEmpty().withMessage('Please, fill Password'),
(req, res) => {
    var message = '';
    if (req.method == "POST") {
        var username = req.body.username;
        var password = req.body.password;

        
            var sql = 'SELECT user_id, first_name, last_name, username, password FROM users WHERE username=?';
            conn.query(sql, [username], (err, result) => {
                if (err) {
                    throw err;
                }

                if (result.length) {
             
                    bcrypt.compare(password, result[0].password, (err, passwordMatch) => {
                        if (err) {
                            throw err;
                        }

                        if (passwordMatch) {
                            req.session.userID = result[0].user_id;
                            req.session.user = result[0];
                            console.log(req.session.userID);
                            message="You successfully logged in"
                            req.session.loggedIn = true;
                           
                            
                            res.redirect('/dashboard');
                        } else {
                            message = "Invalid username or password";
                            res.render('login', { message: message });
                        }
                    });
                } else {
                
                    message = "Invalid username or password";
                    res.render('login', { message: message });
                }
            });
        
    } else {
        res.render('login', { message: message });
    }
});

var message = '';
var valid='';
app.get('/register',(req,res)=>{
    res.render('register',{message:message,valid:valid});
})
app.post('/register',
 body('first_name').trim().escape().not().isEmpty().withMessage('Please, fill First name'),
 body('last_name').trim().escape().not().isEmpty().withMessage('Please, fill Last name')
 ,body('email').not().isEmpty().withMessage('Please, fill Email address').isEmail().withMessage('Dont have proper Email standard!').normalizeEmail()
 ,body('username').not().isEmpty().withMessage('Please, fill Username').isLength({min:3}).withMessage('Username should be at least 3 characters')
 ,body('password').not().isEmpty().withMessage('Please, fill Password').isLength({min:8}).withMessage("Password should be at least 8 characters")
 .matches('[0-9]').withMessage('Password should contain numbers')
 .matches('[a-z]').withMessage('Password should contain lowercase letter')
 .matches('[A-Z]').withMessage("Password should contain uppercase letter")
 ,body('confirm_password').not().isEmpty().withMessage('Please, fill Confirm password'),(req, res) => {
    
    if (req.method == "POST") {
        const errors=validationResult(req);
        if(!errors.isEmpty())
        {console.log(errors.array())
            res.render('register',{message:message,valid:errors.array()})
    }
    else{
        var uid = uuid.v4();
        var first_name = req.body.first_name;
        var last_name = req.body.last_name;
        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;
        var confirm_password=req.body.confirm_password;
      
            var sql = "select * from users where email=?";
            conn.query(sql, [email], (err, result) => {
                if (result.length) {
                    res.render('register', { message: "This mobile email address has already registered!",valid:valid });
                } else {
                    var sql2 = "select * from users where username=?";
                    conn.query(sql2, [username], (err2, result2) => {
                        if (result2.length) {
                            res.render('register', { message: "This username has already taken!",valid:valid });
                        } 
                        else{
                            if(confirm_password!=password)
                            {
                                res.render('register',{message:"Passwords should match",valid:valid})
                            }
                        else {
                            bcrypt.genSalt(10, (err, salt) => {
                                if (err) {
                                    throw err;
                                }

                                bcrypt.hash(password, salt, (err, hash) => {
                                    if (err) {
                                        throw err;
                                    }

                                    var insert = "insert into users(user_id,first_name, last_name,email, username, password) values(?,?,?,?,?,?)";
                                    conn.query(insert, [uid,first_name, last_name, email, username, hash], (err3, result3) => {
                                        if (err3) {
                                            throw err3;
                                        }

                                        res.redirect('/login');

                                    });
                                });
                            });
                        }
                    }
                    });
                }
            });
 
    } }else {
        res.render('register', { message: message });
    }
});

// admin --------------------------------------
app.get('/admin-login', (req, res) => {
    res.render('adminLogin', { message: message });
});
app.post('/admin-login', 
    body('username').not().isEmpty().withMessage('Please, fill Username'),
    body('password').not().isEmpty().withMessage('Please, fill Password'),
    (req, res) => {
        var message = '';

        if (req.method == "POST") {
            var username = req.body.username;
            var password = req.body.password;

            var sql = 'SELECT admin_id, username, password FROM admin WHERE username=?';
            conn.query(sql, [username], (err, result) => {
                if (err) {
                    throw err;
                }

                if (result.length) {
                    bcrypt.compare(password, result[0].password, (err, passwordMatch) => {
                        if (err) {
                            throw err;
                        }

                        if (passwordMatch) {
                            req.session.adminID = result[0].admin_id;
                            req.session.admin = result[0];
                            message = "Admin login successful";
                            req.session.adminLoggedIn = true;
                            res.redirect('/admin-dashboard');
                        } else {
                            message = "Invalid admin username or password";
                            res.render('adminLogin', { message: message });
                        }
                    });
                } else {
                    message = "Invalid admin username or password";
                    res.render('adminLogin', { message: message });
                }
            });
        } else {
            res.render('adminLogin', { message: message });
        }
    }
);







app.get('/admin-dashboard', (req, res) => {
    if (req.session.adminLoggedIn) {
       
        res.render('admin-dashboard', { username: req.session.admin.username });
    } else {
        res.render('adminLogin', { message: "You are not logged in" });
    }
});

app.get('/admin/edit-users', (req, res) => {
    if (req.session.adminLoggedIn) {
    
        const sql = 'SELECT user_id, first_name, last_name, email, username FROM users';
        conn.query(sql, (err, users) => {
            if (err) {
                console.error(err);
                res.redirect('/admin-dashboard');
            } else {
                
                res.render('admin-edit-users', { users });
            }
        });
    } else {
        res.render('adminLogin', { message: "You are not logged in" });
    }
});

app.get('/admin/delete-users', (req, res) => {
    if (req.session.adminLoggedIn) {
       
        const sql = 'SELECT user_id, first_name, last_name, email, username FROM users';
        conn.query(sql, (err, users) => {
            if (err) {
                console.error(err);
                res.redirect('/admin-dashboard');
            } else {
     res.render('admin-delete-users', { users });
            }
        });
    } else {
        res.render('adminLogin', { message: "You are not logged in" });
    }
});


app.get('/admin/edit-posts', (req, res) => {
    if (req.session.adminLoggedIn) {
    const sql = 'SELECT post_id, title, content, category FROM posts';
        conn.query(sql, (err, posts) => {
            if (err) {
            console.error(err);
                res.redirect('/admin-dashboard');
            } else {
               
                res.render('admin-edit-posts', { posts });
            }
        });
    } else {
        res.render('adminLogin', { message: "You are not logged in" });
    }
});

app.get('/admin/delete-posts', (req, res) => {
    if (req.session.adminLoggedIn) {
       
        const sql = 'SELECT post_id, title, content, category FROM posts';
        conn.query(sql, (err, posts) => {
            if (err) {
                console.error(err);
                res.redirect('/admin-dashboard');
            } else { res.render('admin-delete-posts', { posts });
            }
        });
    } else {
        res.render('adminLogin', { message: "You are not logged in" });
    }
});


// Admin Edit User
app.get('/admin/edit-user/:userId', async (req, res) => {
    if (req.session.adminLoggedIn) {
        const userId = req.params.userId;

        const sql = 'SELECT user_id, first_name, last_name, email, username FROM users WHERE user_id = ?';
        conn.query(sql, [userId], (err, result) => {
            if (err) {
                console.error(err);
                res.redirect('/admin-dashboard');
            } else {
                if (result.length > 0) {
                    res.render('admin-edit-user', { user: result[0] });
                } else {
                    res.redirect('/admin-dashboard');
                }
            }
        });
    } else {
        res.render('adminLogin', { message: "You are not logged in" });
    }
});

app.post('/admin/edit-user/:userId', (req, res) => {
    const userId = req.params.userId;
    const { first_name, last_name, email, username } = req.body;

    // Update user data in the database
    const sql = 'UPDATE users SET first_name = ?, last_name = ?, email = ?, username = ? WHERE user_id = ?';
    conn.query(sql, [first_name, last_name, email, username, userId], (err, result) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/admin-dashboard');
    });
});

// Admin Delete User
app.get('/admin/delete-user/:userId', async (req, res) => {
    if (req.session.adminLoggedIn) {
        const userId = req.params.userId;

        // Delete user from the database
        const sql = 'DELETE FROM users WHERE user_id = ?';
        conn.query(sql, [userId], (err, result) => {
            if (err) {
                console.error(err);
            }
            res.redirect('/admin-dashboard');
        });
    } else {
        res.render('adminLogin', { message: "You are not logged in" });
    }
});

// Admin Edit Post
app.get('/admin/edit-post/:postId', async (req, res) => {
    if (req.session.adminLoggedIn) {
        const postId = req.params.postId;

        const sql = 'SELECT post_id, title, content, category FROM posts WHERE post_id = ?';
        conn.query(sql, [postId], (err, result) => {
            if (err) {
                console.error(err);
                res.redirect('/admin-dashboard');
            } else {
                if (result.length > 0) {
                    res.render('admin-edit-post', { post: result[0] });
                } else {
                    res.redirect('/admin-dashboard');
                }
            }
        });
    } else {
        res.render('adminLogin', { message: "You are not logged in" });
    }
});

app.post('/admin/edit-post/:postId', (req, res) => {
    const postId = req.params.postId;
    const { title, content, category } = req.body;

    const sql = 'UPDATE posts SET title = ?, content = ?, category = ? WHERE post_id = ?';
    conn.query(sql, [title, content, category, postId], (err, result) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/admin-dashboard');
    });
});

// Admin Delete Post
app.get('/admin/delete-post/:postId', async (req, res) => {
    if (req.session.adminLoggedIn) {
        const postId = req.params.postId;

        const sql = 'DELETE FROM posts WHERE post_id = ?';
        conn.query(sql, [postId], (err, result) => {
            if (err) {
                console.error(err);
            }
            res.redirect('/admin-dashboard');
        });
    } else {
        res.render('adminLogin', { message: "You are not logged in" });
    }
});


app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.clearCookie('user');
        res.redirect('/login');
    });
});

// Blog Posts---------------------------------------------------------------------------------------
app.get('/create', (req, res) => {
    if (req.session.loggedIn) {
        res.render('create');
    } else {
        res.render('login', { message: 'You are not logged in' });
    }
});

app.post('/create', (req, res) => {
    const { title, content, category } = req.body;
    const userId = req.session.userID;

    const postID=uuid.v4();
    const sql = 'INSERT INTO posts (post_id,title, content, category,  user_id) VALUES (?,?, ?, ?, ?)';
    conn.query(sql, [postID,title, content, category, userId], (err, result) => {
        if (err) {
            console.error(err);
            res.redirect('/dashboard');
        } else {
            res.redirect('/dashboard');
        }
    });
});

// Function to get posts based on feed type (global or user's own blogs')
async function getPosts(feedType, userId) {
    return new Promise((resolve, reject) => {
        let sql;

        if (feedType === 'global') {
            sql = 'SELECT posts.post_id, posts.title, posts.content, posts.category, users.username FROM posts JOIN users ON posts.user_id = users.user_id';
        } else if (feedType === 'user' && userId) {
            sql = 'SELECT post_id, title, content, category FROM posts WHERE user_id = ?';
        } else {
            reject(new Error('Invalid feed type or user ID'));
        }

        conn.query(sql, userId ? [userId] : [], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}


// app.get('/dashboard',async(req,res)=>{
//     if(req.session.loggedIn)
// {
        
//     const posts = await getPosts('global');
//     // console.log(req.session.user.username)
//     res.render('dashboard', {username:req.session.user.username, posts });
    
//  }
//     else
//     res.render('login',{message:"You are not logged in"})
// })


app.get('/dashboard', async (req, res) => {
    if (req.session.loggedIn) {
        const { searchCriteria, searchTerm } = req.query;
        let posts;
        if (searchCriteria && searchTerm) {
            posts = await searchPosts(searchCriteria, searchTerm);
        } else {
            posts = await getPosts('global');
        }
        res.render('dashboard', { username: req.session.user.username, posts, searchCriteria, searchTerm });
    } else {
        res.render('login', { message: "You are not logged in" });
    }
});

async function searchPosts(criteria, term) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT A.post_id, A.title, A.content, A.category, B.username FROM posts as A Inner Join users as B on A.user_id=B.user_id WHERE ${criteria} LIKE ?`;
        conn.query(sql, [`%${term}%`], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}



app.get('/my-feed', async (req, res) => {
    if (req.session.loggedIn) {
        const userId = req.session.userID;
        const userPosts = await getPosts('user', userId);

        res.render('myblogs', { posts: userPosts });
    } else {
        res.render('login', { message: "You are not logged in" });
    }
});

app.get('/blog/:postId', async (req, res) => {
    const postId = req.params.postId;
    const userId = req.session.userID;

    const sql = 'SELECT posts.post_id, posts.title, posts.content, posts.category,users.username FROM posts Join users On posts.user_id=users.user_id WHERE post_id = ?';
    conn.query(sql, [postId], (err, result) => {
        if (err) {
            console.error(err);
            res.redirect('/dashboard');
        } else {
            if (result.length > 0) {
                // console.log(result[0])
                res.render('blogdetails', { post: result[0] });
            } else {
                res.redirect('/dashboard');
            }
        }
    });
});

app.get('/edit/:postId', async (req, res) => {
    if (req.session.loggedIn) {
        const postId = req.params.postId;
        const userId = req.session.userID;

        const sql = 'SELECT posts.post_id, posts.title, posts.content, posts.category FROM posts WHERE post_id = ? AND user_id = ?';
        conn.query(sql, [postId, userId], (err, result) => {
            if (err) {
                console.error(err);
                res.redirect('/dashboard');
            } else {
                if (result.length > 0) {
                    res.render('edit', { post: result[0] });
                } else {
                    res.redirect('/dashboard');
                }
            }
        });
    } else {
        res.render('login', { message: "You are not logged in" });
    }
});

app.post('/edit/:postId', (req, res) => {
    const postId = req.params.postId;
    const { title, content, category} = req.body;

    const sql = 'UPDATE posts SET title = ?, content = ?, category = ?WHERE post_id = ?';
    conn.query(sql, [title, content, category, postId], (err, result) => {
        if (err) {
            console.error(err);
            res.redirect('/dashboard');
        } else {
            res.redirect('/dashboard');
        }
    });
});
app.get('/delete/:postId', async (req, res) => {
    if (req.session.loggedIn) {
        const postId = req.params.postId;
        const userId = req.session.userID;

        const sql = 'DELETE FROM posts WHERE post_id = ? AND user_id = ?';
        conn.query(sql, [postId, userId], (err, result) => {
            if (err) {
                console.error(err);
            }
            res.redirect('/dashboard');
        });
    } else {
        res.render('login', { message: "You are not logged in" });
    }
});

app.listen(5000, '0.0.0.0', () => {
    console.log('Server is running on port 5000');
  });
