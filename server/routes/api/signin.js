// Code is used from @Keithweaver_ on medium.com

const User = require("../../models/User");
const UserSession = require("../../models/UserSession");

module.exports = app => {
  /*
   * Sign up
   */
  app.post("/api/account/signup", (req, res, next) => {
    const { body } = req;
    const { password } = body;
    let { username } = body;

	if (!password && !username) {
      return res.send({
        success: false,
        messagePass: "Error: Password cannot be blank",
        messageUser: "Error: Username cannot be blank"
      });
    }
    if ((username.length < 3) || !checkUser(username)) {
      return res.send({
        success: false,
        messageUser: "Error: Username must contain at least 3 letters"
      });
    }
    if ((password.length < 5) || !checkCase(password)) {
      return res.send({
        success: false,
        messagePass: "Error: Password must contain an uppercase and numeric and be longer than 5 characters"
      });
    }
	// function to check password criteria
	function checkCase(pw) {
		let uppercase = 0;
		let numeric = 0;
		for(i = 0; i < pw.length; i++) {
			if('A' <= pw[i] && pw[i] <= 'Z') uppercase++; // check if you have an uppercase
			if('0' <= pw[i] && pw[i] <= '9') numeric++; // check if you have a numeric
		}
		if((uppercase >= 1) && (numeric >= 1)) return true;
		else return false;
	}
	// function to check username criteria
	function checkUser(usr) {
		let uppercase = 0;
		let lowercase = 0;
		for(i = 0; i < usr.length; i++) {
			if('A' <= usr[i] && usr[i] <= 'Z') uppercase++; // check if you have an uppercase
			if('a' <= usr[i] && usr[i] <= 'z') lowercase++; // check if you have a lowercase
		}
		if(uppercase+lowercase >= 3) return true;
		else return false;
	}

    username = username.toLowerCase();
    username = username.trim();

    // Steps:
    // 1. Verify username doesn't exist
    // 2. Save
    User.find(
      {
        username: username
      },
      (err, previousUsers) => {
        if (err) {
          return res.send({
            success: false,
            message: "Error: Server error"
          });
        } else if (previousUsers.length > 0) {
          return res.send({
            success: false,
            message: "Error: Account already exists."
          });
        }

        // Save the new user
        const newUser = new User();

        newUser.username = username;
        newUser.password = newUser.generateHash(password);
        newUser.save((err, user) => {
          if (err) {
            return res.send({
              success: false,
              message: "Error: Server error"
            });
          }
          return res.send({
            success: true,
            message: "Signed up"
          });
        });
      }
    );
  });

  app.post("/api/account/signin", (req, res, next) => {
    const { body } = req;
    const { password } = body;
    let { username } = body;

	
	if (!password && !username) {
      return res.send({
        success: false,
        messagePass: "Error: Password cannot be blank.",
        messageUser: "Error: Username cannot be blank"
      });
    }

    if (!username && password) {
      return res.send({
        success: false,
        messageUser: "Error: Username cannot be blank."
      });
    }
    if (!password && username) {
      return res.send({
        success: false,
        messagePass: "Error: Password cannot be blank."
      });
    }
	
    username = username.toLowerCase();
    username = username.trim();

    User.find(
      {
        username: username
      },
      (err, users) => {
        if (err) {
          console.log("err 2:", err);
          return res.send({
            success: false,
            message: "Error: server error"
          });
        }
        if (users.length != 1) {
          return res.send({
            success: false,
            messageUser: "Error: Invalid Username"
          });
        }

        const user = users[0];
        if (!user.validPassword(password)) {
          return res.send({
            success: false,
            messagePass: "Error: Invalid Password"
          });
        }

        // Otherwise correct user
        const userSession = new UserSession();
        userSession.userId = user._id;
        userSession.save((err, doc) => {
          if (err) {
            console.log(err);
            return res.send({
              success: false,
              message: "Error: server error"
            });
          }

          return res.send({
            success: true,
            message: "Valid sign in",
            token: doc._id
          });
        });
      }
    );
  });

  app.get("/api/account/verify", (req, res, next) => {
    // Get the token
    const { query } = req;
    const { token } = query;
    // ?token=test

    // Verify the token is one of a kind and it's not deleted.

    UserSession.find(
      {
        _id: token,
        isDeleted: false
      },
      (err, sessions) => {
        if (err) {
          console.log(err);
          return res.send({
            success: false,
            message: "Error: Server error"
          });
        }

        if (sessions.length != 1) {
          return res.send({
            success: false,
            message: "Error: Invalid"
          });
        } else {
          return res.send({
            success: true,
            message: "Good",
            userId: sessions[0].userId
          });
        }
      }
    );
  });

  app.get("/api/account/logout", (req, res, next) => {
    // Get the token
    const { query } = req;
    const { token } = query;
    // ?token=test

    // Verify the token is one of a kind and it's not deleted.

    UserSession.findOneAndUpdate(
      {
        _id: token,
        isDeleted: false
      },
      {
        $set: {
          isDeleted: true
        }
      },
      null,
      (err, sessions) => {
        if (err) {
          console.log(err);
          return res.send({
            success: false,
            message: "Error: Server error"
          });
        }

        return res.send({
          success: true,
          message: "Good"
        });
      }
    );
  });
};
